import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-10-29.clover",
    })
  : null

type BillingPeriod = "monthly" | "annual"

interface ChangeBillingPeriodRequest {
  newPeriod: BillingPeriod
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 503 }
      )
    }

    const { newPeriod }: ChangeBillingPeriodRequest = await req.json()

    if (!newPeriod || !["monthly", "annual"].includes(newPeriod)) {
      return NextResponse.json(
        { error: "Invalid billing period. Must be 'monthly' or 'annual'" },
        { status: 400 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user || !user.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      )
    }

    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId)

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      )
    }

    // Get the current plan
    const currentPlan = user.plan

    // FREE users shouldn't be able to change billing period
    if (currentPlan === "FREE") {
      return NextResponse.json(
        { error: "Cannot change billing period for FREE plan" },
        { status: 400 }
      )
    }

    // Import price mapping
    const { default: stripePrices } = await import("@/lib/stripe-prices")

    // Get the new price ID based on plan and period
    const newPriceId = stripePrices[currentPlan][newPeriod]

    if (!newPriceId) {
      return NextResponse.json(
        { error: `No price found for ${currentPlan} ${newPeriod}` },
        { status: 400 }
      )
    }

    // Update subscription with new price
    const updatedSubscription = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: "create_prorations", // Charge/credit difference immediately
      }
    )

    console.log(`Billing period changed for user ${user.id}: ${newPeriod}`)

    return NextResponse.json({
      success: true,
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
      },
    })
  } catch (error: any) {
    console.error("Change billing period error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to change billing period" },
      { status: 500 }
    )
  }
}
