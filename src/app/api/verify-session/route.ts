import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import Stripe from "stripe"

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-10-29.clover",
    })
  : null

/**
 * Verify Stripe checkout session
 * Called from the success page to confirm payment completion
 */
export async function GET(req: NextRequest) {
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

    // Get session ID from query params
    const searchParams = req.nextUrl.searchParams
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session_id parameter" },
        { status: 400 }
      )
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Verify the session belongs to the current user
    if (session.metadata?.clerkId !== userId) {
      return NextResponse.json(
        { error: "Session does not belong to current user" },
        { status: 403 }
      )
    }

    // Return session details
    return NextResponse.json({
      session: {
        id: session.id,
        status: session.status,
        paymentStatus: session.payment_status,
        amountTotal: session.amount_total,
        currency: session.currency,
        customerEmail: session.customer_email,
        metadata: session.metadata,
      },
    })
  } catch (error: any) {
    console.error("Session verification error:", error)

    // Handle Stripe errors
    if (error.type === "StripeInvalidRequestError") {
      return NextResponse.json(
        { error: "Invalid session ID" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to verify session" },
      { status: 500 }
    )
  }
}
