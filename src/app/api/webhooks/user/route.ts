import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { enforceQuota } from "@/lib/quota-enforcement"

/**
 * GET /api/webhooks/user
 * List all webhooks for the authenticated user
 */
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const webhooks = await prisma.userWebhook.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { logs: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(webhooks, { status: 200 })
  } catch (error) {
    console.error("Error fetching webhooks:", error)
    return NextResponse.json({ error: "Failed to fetch webhooks" }, { status: 500 })
  }
}

/**
 * POST /api/webhooks/user
 * Create a new webhook
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Enforce webhook_count quota
    const quotaCheck = await enforceQuota(user.id, "webhook_count")
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        {
          error: quotaCheck.reason,
          limit: quotaCheck.limit,
          current: quotaCheck.current,
        },
        { status: 429 }
      )
    }

    const body = await req.json()
    const { name, url, events } = body

    if (!name || !url || !events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: "Name, URL, and at least one event are required" },
        { status: 400 }
      )
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
    }

    // Generate secret for webhook validation
    const secret = crypto.randomBytes(32).toString("hex")

    const webhook = await prisma.userWebhook.create({
      data: {
        userId: user.id,
        name,
        url,
        secret,
        events,
        active: true,
      },
    })

    console.log(`✅ Webhook created: ${name} for user ${user.id}`)

    return NextResponse.json(webhook, { status: 201 })
  } catch (error) {
    console.error("Error creating webhook:", error)
    return NextResponse.json({ error: "Failed to create webhook" }, { status: 500 })
  }
}

/**
 * PATCH /api/webhooks/user
 * Update webhook (toggle active status or other fields)
 */
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await req.json()
    const { id, active, name, url, events } = body

    if (!id) {
      return NextResponse.json({ error: "Webhook ID is required" }, { status: 400 })
    }

    // Verify ownership
    const webhook = await prisma.userWebhook.findUnique({
      where: { id },
    })

    if (!webhook || webhook.userId !== user.id) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}
    if (active !== undefined) updateData.active = active
    if (name) updateData.name = name
    if (url) updateData.url = url
    if (events && Array.isArray(events)) updateData.events = events

    const updatedWebhook = await prisma.userWebhook.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updatedWebhook, { status: 200 })
  } catch (error) {
    console.error("Error updating webhook:", error)
    return NextResponse.json({ error: "Failed to update webhook" }, { status: 500 })
  }
}

/**
 * DELETE /api/webhooks/user?id=<id>
 * Delete a webhook
 */
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const id = req.nextUrl.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Webhook ID is required" }, { status: 400 })
    }

    // Verify ownership
    const webhook = await prisma.userWebhook.findUnique({
      where: { id },
      include: {
        _count: {
          select: { logs: true },
        },
      },
    })

    if (!webhook || webhook.userId !== user.id) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 })
    }

    // Delete webhook (will cascade delete logs)
    await prisma.userWebhook.delete({
      where: { id },
    })

    console.log(`✅ Webhook deleted: ${webhook.name} (${id})`)

    return NextResponse.json(
      {
        message: "Webhook deleted successfully",
        deletedLogs: webhook._count.logs,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting webhook:", error)
    return NextResponse.json({ error: "Failed to delete webhook" }, { status: 500 })
  }
}
