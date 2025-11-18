import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { eventSchema } from "@/lib/validations"

// GET /api/events - List all events for the current user
export async function GET() {
  try {
    const { userId } = await auth()

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

    // Get all events for the user
    const events = await prisma.event.findMany({
      where: { userId: user.id },
      include: {
        category: true,
        quota: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    )
  }
}

// POST /api/events - Create a new event
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()

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

    // Create the event
    const event = await prisma.event.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        scheduledFor: validatedData.scheduledFor ? new Date(validatedData.scheduledFor) : undefined,
        categoryId: validatedData.categoryId,
        userId: user.id,
      },
      include: {
        category: true,
        quota: true,
      },
    })

    // Prepare event payload
    const eventPayload = {
      eventId: event.id,
      eventTitle: event.title,
      eventDescription: event.description || undefined,
      scheduledFor: event.scheduledFor?.toISOString() || undefined,
      categoryId: event.categoryId,
      categoryName: category.name,
      categorySlug: category.slug,
      userId: user.id,
      userEmail: user.email,
    }

    // Import eventBus dynamically to emit event
    const { eventBus } = await import("@/lib/event-bus")

    // Emit event.created event
    eventBus.emit("event.created", eventPayload)

    // Send Discord notification directly (don't rely on event bus in API context)
    const { sendEventCreatedNotification } = await import("@/lib/discord-event-notifier")
    await sendEventCreatedNotification(eventPayload)

    console.log(`✅ Event created: ${event.title} (${event.id})`)

    return NextResponse.json({ event }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating event:", error)

    // Handle Zod validation errors
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    )
  }
}
