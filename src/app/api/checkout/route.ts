import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"
import { PlanType } from "@prisma/client"
import { calculateBillingCycleAnchor } from "@/lib/stripe-helpers"

// Initialize Stripe only if API key is available
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-10-29.clover",
    })
  : null

interface CheckoutRequest {
  priceId: string
  plan: PlanType
  billingPeriod: "monthly" | "annual"
  billingDay?: number
  email?: string
}

export async function POST(req: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables." },
        { status: 503 }
      )
    }

    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body: CheckoutRequest = await req.json()
    const { priceId, plan, billingPeriod, billingDay, email } = body

    console.log("📝 Checkout request received:", { priceId, plan, billingPeriod, billingDay, email })

    if (!priceId || !plan || !billingPeriod) {
      console.error("❌ Missing required fields:", { priceId, plan, billingPeriod })
      return NextResponse.json(
        { error: "Missing required fields: priceId, plan, billingPeriod" },
        { status: 400 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user is trying to "upgrade" to a lower plan (downgrades need different flow)
    const planHierarchy = { FREE: 0, PRO: 1, ENTERPRISE: 2 }
    console.log("📊 Plan check:", { currentPlan: user.plan, requestedPlan: plan, hierarchy: { current: planHierarchy[user.plan], requested: planHierarchy[plan] } })

    // Allow same plan (for changing billing period) or upgrades
    if (planHierarchy[user.plan] > planHierarchy[plan]) {
      console.error("❌ Invalid downgrade attempt:", { currentPlan: user.plan, requestedPlan: plan })
      return NextResponse.json(
        { error: `Downgrades are not supported. Please contact support to change from ${user.plan} to ${plan}` },
        { status: 400 }
      )
    }

    // If user already has an active subscription to this plan, redirect to manage page
    if (user.plan === plan && user.stripeSubscriptionId) {
      console.log("ℹ️ User already has this plan, should manage subscription instead")
      // Allow it anyway - user might want to change billing period
    }

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId

    // Use provided email or fall back to user's email
    const customerEmail = email || user.email

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: customerEmail,
        metadata: {
          clerkId: userId,
          userId: user.id,
        },
      })
      customerId = customer.id

      // Update user with Stripe customer ID and email if provided
      await prisma.user.update({
        where: { id: user.id },
        data: {
          stripeCustomerId: customerId,
          ...(email && { email }), // Update email if provided
        },
      })
    } else if (email && email !== user.email) {
      // Update existing customer email if different
      await stripe.customers.update(customerId, {
        email: customerEmail,
      })

      // Update database
      await prisma.user.update({
        where: { id: user.id },
        data: { email },
      })
    }

    // Prepare subscription creation params
    const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData = {
      metadata: {
        userId: user.id,
        clerkId: userId,
        plan,
        billingPeriod,
      },
    }

    // Add billing cycle anchor if billing day is specified
    // NOTE: Cannot use billing_cycle_anchor with trial_period_days
    if (billingDay && billingDay >= 1 && billingDay <= 28) {
      subscriptionData.billing_cycle_anchor = calculateBillingCycleAnchor(billingDay)
      subscriptionData.proration_behavior = "create_prorations"
      subscriptionData.metadata!.preferredBillingDay = billingDay.toString()
    } else {
      // Add 7-day free trial for new subscriptions (only when no billing_cycle_anchor)
      subscriptionData.trial_period_days = 7
    }

    // Create Stripe checkout session with subscription mode
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: subscriptionData,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing`,
      metadata: {
        userId: user.id,
        clerkId: userId,
        email: user.email,
        plan,
        billingPeriod,
        ...(billingDay && { preferredBillingDay: billingDay.toString() }),
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  // Redirect GET requests to POST for convenience
  return POST(req)
}
