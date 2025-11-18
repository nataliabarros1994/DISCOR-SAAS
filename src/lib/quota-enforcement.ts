import { prisma } from "./prisma"
import { PlanType } from "@prisma/client"
import { eventBus } from "./event-bus"

/**
 * Quota names that can be enforced
 */
export type QuotaName =
  | "category_count"
  | "event_count"
  | "webhooks_per_minute"
  | "webhook_count"
  | "api_requests_per_minute"

/**
 * Default quota limits for each plan
 */
const DEFAULT_QUOTAS: Record<PlanType, Record<QuotaName, number>> = {
  FREE: {
    category_count: 3,
    event_count: 100,
    webhooks_per_minute: 5,
    webhook_count: 1,
    api_requests_per_minute: 10,
  },
  PRO: {
    category_count: 50,
    event_count: 10000,
    webhooks_per_minute: 30,
    webhook_count: 10,
    api_requests_per_minute: 100,
  },
  ENTERPRISE: {
    category_count: -1, // Unlimited
    event_count: -1, // Unlimited
    webhooks_per_minute: 100,
    webhook_count: -1, // Unlimited
    api_requests_per_minute: 1000,
  },
}

/**
 * Initialize default quotas in the database
 */
export async function initializeDefaultQuotas() {
  const plans: PlanType[] = ["FREE", "PRO", "ENTERPRISE"]

  for (const plan of plans) {
    for (const [quotaName, limit] of Object.entries(DEFAULT_QUOTAS[plan])) {
      await prisma.planQuota.upsert({
        where: {
          plan_quotaName: {
            plan,
            quotaName,
          },
        },
        create: {
          plan,
          quotaName,
          limit,
        },
        update: {
          limit,
        },
      })
    }
  }

  console.log("✅ Default plan quotas initialized")
}

/**
 * Get quotas for a specific plan
 */
export async function getPlanQuotas(plan: PlanType): Promise<Record<string, number>> {
  const quotas = await prisma.planQuota.findMany({
    where: { plan },
  })

  const quotaMap: Record<string, number> = {}
  quotas.forEach((quota) => {
    quotaMap[quota.quotaName] = quota.limit
  })

  return quotaMap
}

/**
 * Get current usage for a user
 */
export async function getUserUsage(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      categories: true,
      events: true,
      _count: {
        select: {
          categories: true,
          events: true,
        },
      },
    },
  })

  if (!user) {
    throw new Error("User not found")
  }

  // Get webhook count
  const webhookCount = await prisma.userWebhook.count({
    where: { userId, active: true },
  })

  // Get webhooks sent in last minute
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
  const webhooksLastMinute = await prisma.webhookLog.count({
    where: {
      webhook: { userId },
      createdAt: { gte: oneMinuteAgo },
    },
  })

  return {
    category_count: user._count.categories,
    event_count: user._count.events,
    webhook_count: webhookCount,
    webhooks_per_minute: webhooksLastMinute,
  }
}

/**
 * Check if user can perform an action based on quotas
 */
export async function enforceQuota(
  userId: string,
  quotaName: QuotaName
): Promise<{ allowed: boolean; reason?: string; limit?: number; current?: number }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    })

    if (!user) {
      return { allowed: false, reason: "User not found" }
    }

    // Get plan quota limit
    const planQuota = await prisma.planQuota.findUnique({
      where: {
        plan_quotaName: {
          plan: user.plan,
          quotaName,
        },
      },
    })

    // Get the limit (from DB or default)
    let limit: number
    if (!planQuota) {
      console.warn(`⚠️ Quota ${quotaName} not found for plan ${user.plan}, using default`)
      const defaultLimit = DEFAULT_QUOTAS[user.plan][quotaName]
      if (defaultLimit === undefined) {
        return { allowed: true } // No quota defined = allowed
      }
      limit = defaultLimit
    } else {
      limit = planQuota.limit
    }

    // -1 means unlimited
    if (limit === -1) {
      return { allowed: true }
    }

    // Get current usage
    const usage = await getUserUsage(userId)
    const currentUsage = usage[quotaName as keyof typeof usage] || 0

    // Check if limit exceeded
    if (currentUsage >= limit) {
      // Emit quota exceeded event
      eventBus.emit("quota.exceeded", {
        userId,
        quotaName,
        limit: limit,
        current: currentUsage,
      })

      return {
        allowed: false,
        reason: `Quota exceeded: ${quotaName}. Limit: ${limit}, Current: ${currentUsage}`,
        limit: limit,
        current: currentUsage,
      }
    }

    return { allowed: true, limit: limit, current: currentUsage }
  } catch (error) {
    console.error("Error enforcing quota:", error)
    // On error, allow the action (fail open)
    return { allowed: true }
  }
}

/**
 * Check quota without incrementing (preview)
 */
export async function checkQuota(userId: string, quotaName: QuotaName) {
  return enforceQuota(userId, quotaName)
}

/**
 * Get quota information for display
 */
export async function getQuotaInfo(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  })

  if (!user) {
    throw new Error("User not found")
  }

  const [quotas, usage] = await Promise.all([
    getPlanQuotas(user.plan),
    getUserUsage(userId),
  ])

  return {
    plan: user.plan,
    quotas,
    usage,
    percentage: Object.entries(quotas).reduce((acc, [key, limit]) => {
      const current = usage[key as keyof typeof usage] || 0
      if (limit === -1) {
        acc[key] = 0 // Unlimited
      } else {
        acc[key] = (current / limit) * 100
      }
      return acc
    }, {} as Record<string, number>),
  }
}
