import { PlanType } from "@prisma/client"
import { prisma } from "@/lib/prisma"

/**
 * Check if user can create a new event based on their plan limits
 */
export async function canCreateEvent(userId: string): Promise<{
  allowed: boolean
  reason?: string
  limit?: number
  current?: number
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    return { allowed: false, reason: "User not found" }
  }

  // PRO and ENTERPRISE have unlimited events
  if (user.plan === "PRO" || user.plan === "ENTERPRISE") {
    return { allowed: true }
  }

  // FREE plan: 100 events per month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const eventsThisMonth = await prisma.event.count({
    where: {
      userId,
      createdAt: { gte: startOfMonth },
    },
  })

  const limit = 100
  const allowed = eventsThisMonth < limit

  return {
    allowed,
    reason: allowed ? undefined : "Monthly event limit reached for FREE plan",
    limit,
    current: eventsThisMonth,
  }
}

/**
 * Check if user can create a new category based on their plan limits
 */
export async function canCreateCategory(userId: string): Promise<{
  allowed: boolean
  reason?: string
  limit?: number
  current?: number
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { _count: { select: { categories: true } } },
  })

  if (!user) {
    return { allowed: false, reason: "User not found" }
  }

  // PRO and ENTERPRISE have unlimited categories
  if (user.plan === "PRO" || user.plan === "ENTERPRISE") {
    return { allowed: true }
  }

  // FREE plan: 3 categories
  const limit = 3
  const current = user._count.categories
  const allowed = current < limit

  return {
    allowed,
    reason: allowed ? undefined : "Category limit reached for FREE plan",
    limit,
    current,
  }
}

/**
 * Check if user can access analytics features
 */
export function canAccessAnalytics(plan: PlanType): boolean {
  return plan !== "FREE"
}

/**
 * Check if user can use API features
 */
export function canUseAPI(plan: PlanType): boolean {
  return plan !== "FREE"
}

/**
 * Get API rate limit per month for the user's plan
 */
export function getAPIRateLimit(plan: PlanType): number | "unlimited" {
  switch (plan) {
    case "FREE":
      return 0
    case "PRO":
      return 10000 // 10K calls per month
    case "ENTERPRISE":
      return "unlimited"
  }
}

/**
 * Get maximum team members for the plan
 */
export function getTeamMemberLimit(plan: PlanType): number | "unlimited" {
  switch (plan) {
    case "FREE":
      return 1
    case "PRO":
      return 5
    case "ENTERPRISE":
      return "unlimited"
  }
}

/**
 * Get data retention period for the plan
 */
export function getDataRetention(plan: PlanType): string {
  switch (plan) {
    case "FREE":
      return "7 days"
    case "PRO":
      return "90 days"
    case "ENTERPRISE":
      return "unlimited"
  }
}

/**
 * Check if user can add a new team member
 */
export async function canAddTeamMember(userId: string): Promise<{
  allowed: boolean
  reason?: string
  limit?: number | "unlimited"
  current?: number
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    return { allowed: false, reason: "User not found" }
  }

  const limit = getTeamMemberLimit(user.plan)

  if (limit === "unlimited") {
    return { allowed: true, limit }
  }

  // For now, we'll assume 1 team member (the user)
  // In a full implementation, you'd have a TeamMember model
  const currentMembers = 1 // Would query TeamMember table

  return {
    allowed: currentMembers < limit,
    reason:
      currentMembers < limit
        ? undefined
        : `Team member limit reached for ${user.plan} plan`,
    limit,
    current: currentMembers,
  }
}

/**
 * Get current usage stats for a user
 */
export async function getUserUsageStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          events: true,
          categories: true,
        },
      },
    },
  })

  if (!user) {
    throw new Error("User not found")
  }

  // Count events this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const eventsThisMonth = await prisma.event.count({
    where: {
      userId,
      createdAt: { gte: startOfMonth },
    },
  })

  // Get limits based on plan
  const eventLimit = user.plan === "FREE" ? 100 : "unlimited"
  const categoryLimit = user.plan === "FREE" ? 3 : "unlimited"
  const apiLimit = getAPIRateLimit(user.plan)

  return {
    plan: user.plan,
    events: {
      current: eventsThisMonth,
      limit: eventLimit,
      percentage:
        eventLimit === "unlimited"
          ? 0
          : Math.round((eventsThisMonth / eventLimit) * 100),
    },
    categories: {
      current: user._count.categories,
      limit: categoryLimit,
      percentage:
        categoryLimit === "unlimited"
          ? 0
          : Math.round((user._count.categories / categoryLimit) * 100),
    },
    api: {
      current: 0, // Would track API calls in a separate table
      limit: apiLimit,
      percentage: 0,
    },
  }
}
