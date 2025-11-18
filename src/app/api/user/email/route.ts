import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const user = await currentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user email from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: {
        email: true,
      },
    })

    if (!dbUser) {
      // Return email from Clerk if not in database yet
      return NextResponse.json({
        email: user.emailAddresses[0]?.emailAddress || "",
      })
    }

    return NextResponse.json({
      email: dbUser.email,
    })
  } catch (error) {
    console.error("Error fetching user email:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
