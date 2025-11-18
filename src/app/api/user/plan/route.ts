import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: {
        plan: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        currentPeriodEnd: true,
      },
    })

    if (!dbUser) {
      return NextResponse.json({ plan: "FREE" })
    }

    return NextResponse.json({
      plan: dbUser.plan,
      stripeCustomerId: dbUser.stripeCustomerId,
      stripeSubscriptionId: dbUser.stripeSubscriptionId,
      currentPeriodEnd: dbUser.currentPeriodEnd,
    })
  } catch (error) {
    console.error("Error fetching user plan:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
