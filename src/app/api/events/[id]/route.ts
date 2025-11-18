import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { eventSchema } from "@/lib/validations"

// GET /api/events/[id] - Get a specific event
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await params

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get the event
    const event = await prisma.event.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        category: true,
        quota: true,
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    )
  }
}

// PATCH /api/events/[id] - Update an event
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await params

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify the event belongs to the user
    const existingEvent = await prisma.event.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Parse and validate request body
    const body = await req.json()
    const validatedData = eventSchema.parse(body)

    // Verify the category belongs to the user
    const category = await prisma.category.findFirst({
      where: {
        id: validatedData.categoryId,
        userId: user.id,
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: "Category not found or does not belong to you" },
        { status: 404 }
      )
    }

    // Update the event
    const event = await prisma.event.update({
      where: { id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        categoryId: validatedData.categoryId,
      },
      include: {
        category: true,
        quota: true,
      },
    })

    return NextResponse.json({ event })
  } catch (error: any) {
    console.error("Error updating event:", error)

    // Handle Zod validation errors
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    )
  }
}

// DELETE /api/events/[id] - Delete an event
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await params

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify the event belongs to the user
    const event = await prisma.event.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Delete the event
    await prisma.event.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    )
  }
}
