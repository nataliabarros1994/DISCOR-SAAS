import { NextRequest, NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { categorySchema } from "@/lib/validations"
import { notifyDiscordCategoryCreated } from "@/lib/discord"
import { enforceQuota } from "@/lib/quota-enforcement"
import { eventBus } from "@/lib/event-bus"

/**
 * Helper function to generate slug from name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
}

/**
 * GET /api/categories
 * List all categories for the authenticated user
 */
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

    // Get all categories for the user
    const categories = await prisma.category.findMany({
      where: { userId: user.id },
      include: {
        events: {
          orderBy: { createdAt: "desc" },
          take: 5, // Include last 5 events per category
        },
        _count: {
          select: { events: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ categories }, { status: 200 })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/categories
 * Create a new category with Discord notification
 */
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

    // Enforce quota before creation
    const quotaCheck = await enforceQuota(user.id, "category_count")
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        {
          error: quotaCheck.reason,
          limit: quotaCheck.limit,
          current: quotaCheck.current,
        },
        { status: 429 } // Too Many Requests
      )
    }

    // Parse and validate request body
    const body = await req.json()
    const validatedData = categorySchema.parse(body)

    // Generate unique slug
    let slug = generateSlug(validatedData.name)
    let slugCounter = 1

    // Check if slug already exists, if so, append counter
    while (
      await prisma.category.findUnique({
        where: { slug },
      })
    ) {
      slug = `${generateSlug(validatedData.name)}-${slugCounter}`
      slugCounter++
    }

    // Create the category
    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        slug,
        metadata: validatedData.metadata || null,
        userId: user.id,
      },
      include: {
        events: true,
      },
    })

    // Get user email from Clerk for Discord notification
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(userId)
    const userEmail = clerkUser.emailAddresses[0]?.emailAddress || "Unknown"

    // Send Discord notification (non-blocking - don't fail creation if this fails)
    notifyDiscordCategoryCreated(category, userEmail).catch((error) => {
      console.error("❌ Failed to send Discord notification (non-blocking):", error)
      // Don't fail the request - just log the error
    })

    // Emit category.created event
    eventBus.emit("category.created", {
      categoryId: category.id,
      categoryName: category.name,
      categorySlug: category.slug,
      userId: user.id,
      userEmail,
      metadata: category.metadata || undefined,
    })

    console.log(`✅ Category created: ${category.name} (${category.slug})`)

    return NextResponse.json({ category }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating category:", error)

    // Handle Zod validation errors
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/categories
 * Update a category by slug
 * Body: { slug: string, name?: string, metadata?: object }
 */
export async function PUT(req: NextRequest) {
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

    const body = await req.json()
    const { slug, name, metadata } = body

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 })
    }

    // Find the category
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    })

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Verify ownership
    if (existingCategory.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Prepare update data
    const updateData: any = {}

    if (name) {
      updateData.name = name
      // Regenerate slug if name changes
      let newSlug = generateSlug(name)
      let slugCounter = 1

      // Check if new slug exists (excluding current category)
      while (
        await prisma.category.findFirst({
          where: {
            slug: newSlug,
            id: { not: existingCategory.id },
          },
        })
      ) {
        newSlug = `${generateSlug(name)}-${slugCounter}`
        slugCounter++
      }

      updateData.slug = newSlug
    }

    if (metadata !== undefined) {
      updateData.metadata = metadata
    }

    // Update the category
    const updatedCategory = await prisma.category.update({
      where: { slug },
      data: updateData,
      include: {
        events: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    })

    // Emit category.updated event
    eventBus.emit("category.updated", {
      categoryId: updatedCategory.id,
      categoryName: updatedCategory.name,
      categorySlug: updatedCategory.slug,
      userId: user.id,
      changes: updateData,
    })

    console.log(`✅ Category updated: ${updatedCategory.name} (${updatedCategory.slug})`)

    return NextResponse.json({ category: updatedCategory }, { status: 200 })
  } catch (error: any) {
    console.error("Error updating category:", error)
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/categories?slug=<slug>
 * Delete a category by slug
 */
export async function DELETE(req: NextRequest) {
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

    // Get slug from query parameters
    const slug = req.nextUrl.searchParams.get("slug")

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 })
    }

    // Find the category
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { events: true },
        },
      },
    })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Verify ownership
    if (category.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete the category (will cascade delete events)
    await prisma.category.delete({
      where: { slug },
    })

    // Emit category.deleted event
    eventBus.emit("category.deleted", {
      categoryId: category.id,
      categoryName: category.name,
      categorySlug: category.slug,
      userId: user.id,
      deletedEvents: category._count.events,
    })

    console.log(`✅ Category deleted: ${category.name} (${slug})`)

    return NextResponse.json(
      {
        message: "Category deleted successfully",
        deletedEvents: category._count.events,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    )
  }
}
