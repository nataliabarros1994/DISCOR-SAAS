import { prisma } from "./prisma"
import { eventBus, SystemEventName, SystemEventMap } from "./event-bus"

/**
 * EventTracker - Automatically logs all system events to the database
 */
class EventTracker {
  private initialized = false

  /**
   * Initialize the event tracker
   * Subscribes to all system events and logs them to the database
   */
  initialize() {
    if (this.initialized) {
      console.log("⚠️ EventTracker already initialized")
      return
    }

    // Subscribe to all possible events
    const eventNames: SystemEventName[] = [
      "category.created",
      "category.updated",
      "category.deleted",
      "event.created",
      "event.deleted",
      "user.plan.upgraded",
      "user.plan.downgraded",
      "user.plan.canceled",
      "quota.exceeded",
      "webhook.sent",
      "payment.succeeded",
      "payment.failed",
    ]

    eventNames.forEach((eventName) => {
      eventBus.subscribe(eventName, async (payload) => {
        await this.logEvent(eventName, payload)
      })
    })

    this.initialized = true
    console.log("✅ EventTracker initialized - all events will be logged to database")
  }

  /**
   * Log an event to the database
   */
  private async logEvent<T extends SystemEventName>(
    eventName: T,
    payload: SystemEventMap[T]
  ): Promise<void> {
    try {
      // Extract userId from payload if available
      const userId = this.extractUserId(payload)

      await prisma.systemEvent.create({
        data: {
          eventName,
          payload: payload as any,
          userId,
        },
      })

      console.log(`📝 Event logged to database: ${eventName}`)
    } catch (error) {
      console.error(`❌ Failed to log event ${eventName} to database:`, error)
      // Don't throw - logging should not break the application
    }
  }

  /**
   * Extract userId from payload (different events have userId in different places)
   */
  private extractUserId(payload: any): string | null {
    return payload.userId || null
  }

  /**
   * Get event statistics
   */
  async getStats(options?: {
    eventName?: string
    userId?: string
    startDate?: Date
    endDate?: Date
  }) {
    const where: any = {}

    if (options?.eventName) where.eventName = options.eventName
    if (options?.userId) where.userId = options.userId
    if (options?.startDate || options?.endDate) {
      where.createdAt = {}
      if (options.startDate) where.createdAt.gte = options.startDate
      if (options.endDate) where.createdAt.lte = options.endDate
    }

    const [total, byEvent] = await Promise.all([
      prisma.systemEvent.count({ where }),
      prisma.systemEvent.groupBy({
        by: ["eventName"],
        where,
        _count: true,
        orderBy: {
          _count: {
            eventName: "desc",
          },
        },
      }),
    ])

    return {
      total,
      byEvent: byEvent.map((item) => ({
        eventName: item.eventName,
        count: item._count,
      })),
    }
  }

  /**
   * Get recent events
   */
  async getRecentEvents(limit = 50, eventName?: string) {
    return prisma.systemEvent.findMany({
      where: eventName ? { eventName } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
    })
  }

  /**
   * Clear old events (useful for cleanup jobs)
   */
  async clearOldEvents(daysToKeep = 90) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const result = await prisma.systemEvent.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    })

    console.log(`🗑️ Deleted ${result.count} events older than ${daysToKeep} days`)
    return result.count
  }
}

// Singleton instance
export const eventTracker = new EventTracker()
