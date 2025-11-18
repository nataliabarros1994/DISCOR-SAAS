import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-10-29.clover",
    })
  : null

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

    const { paymentIntentId, amount, reason } = await req.json()

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Payment Intent ID is required" },
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

    // Create refund
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      ...(amount && { amount }), // Partial refund if amount specified
      reason: reason || "requested_by_customer",
      metadata: {
        userId: user.id,
        clerkId: userId,
      },
    })

    console.log(`Refund created: ${refund.id} for user ${user.id}`)

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount,
        status: refund.status,
        created: refund.created,
      },
    })
  } catch (error: any) {
    console.error("Refund error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create refund" },
      { status: 500 }
    )
  }
}

// GET - Retrieve refund information
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

    const { searchParams } = new URL(req.url)
    const refundId = searchParams.get("refundId")

    if (!refundId) {
      return NextResponse.json(
        { error: "Refund ID is required" },
        { status: 400 }
      )
    }

    // Retrieve refund
    const refund = await stripe.refunds.retrieve(refundId)

    return NextResponse.json({
      refund: {
        id: refund.id,
        amount: refund.amount,
        status: refund.status,
        reason: refund.reason,
        created: refund.created,
      },
    })
  } catch (error: any) {
    console.error("Refund retrieval error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to retrieve refund" },
      { status: 500 }
    )
  }
}
