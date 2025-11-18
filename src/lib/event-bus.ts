/**
 * EventBus - Internal event system for the application
 * Supports emit, subscribe, and unsubscribe operations
 */

// Define all possible system events and their payloads
export type SystemEventMap = {
  "category.created": {
    categoryId: string
    categoryName: string
    categorySlug: string
    userId: string
    userEmail: string
    metadata?: any
  }
  "category.updated": {
    categoryId: string
    categoryName: string
    categorySlug: string
    userId: string
    changes: Record<string, any>
  }
  "category.deleted": {
    categoryId: string
    categoryName: string
    categorySlug: string
    userId: string
    deletedEvents: number
  }
  "event.created": {
    eventId: string
    eventTitle: string
    eventDescription?: string
    scheduledFor?: string // ISO 8601 date string
    categoryId: string
    categoryName: string
    categorySlug: string
    userId: string
    userEmail: string
  }
  "event.deleted": {
    eventId: string
    eventTitle: string
    categoryId: string
    userId: string
  }
  "user.plan.upgraded": {
    userId: string
    userEmail: string
    fromPlan: string
    toPlan: string
    billingPeriod: string
    stripeSubscriptionId?: string
  }
  "user.plan.downgraded": {
    userId: string
    userEmail: string
    fromPlan: string
    toPlan: string
    reason: string
  }
  "user.plan.canceled": {
    userId: string
    userEmail: string
    plan: string
    canceledAt: Date
  }
  "quota.exceeded": {
    userId: string
    quotaName: string
    limit: number
    current: number
  }
  "webhook.sent": {
    webhookId: string
    userId: string
    eventName: string
    status: "success" | "failed"
    responseStatus?: number
  }
  "payment.succeeded": {
    userId: string
    amount: number
    currency: string
    stripePaymentId: string
  }
  "payment.failed": {
    userId: string
    amount: number
    currency: string
    reason: string
  }
}

export type SystemEventName = keyof SystemEventMap

type EventHandler<T extends SystemEventName> = (payload: SystemEventMap[T]) => void | Promise<void>

class EventBus {
  private listeners: Map<SystemEventName, Set<EventHandler<any>>> = new Map()
  private eventHistory: Array<{ event: SystemEventName; payload: any; timestamp: Date }> = []
  private maxHistory = 100

  /**
   * Subscribe to an event
   */
  subscribe<T extends SystemEventName>(
    eventName: T,
    handler: EventHandler<T>
  ): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set())
    }

    this.listeners.get(eventName)!.add(handler)

    console.log(`📡 Event listener registered for: ${eventName}`)

    // Return unsubscribe function
    return () => this.unsubscribe(eventName, handler)
  }

  /**
   * Unsubscribe from an event
   */
  unsubscribe<T extends SystemEventName>(
    eventName: T,
    handler: EventHandler<T>
  ): void {
    const handlers = this.listeners.get(eventName)
    if (handlers) {
      handlers.delete(handler)
      console.log(`📡 Event listener removed for: ${eventName}`)
    }
  }

  /**
   * Emit an event
   */
  async emit<T extends SystemEventName>(
    eventName: T,
    payload: SystemEventMap[T]
  ): Promise<void> {
    const timestamp = new Date()

    // Add to history
    this.eventHistory.push({ event: eventName, payload, timestamp })
    if (this.eventHistory.length > this.maxHistory) {
      this.eventHistory.shift()
    }

    console.log(`🚀 Event emitted: ${eventName}`, payload)

    const handlers = this.listeners.get(eventName)
    if (!handlers || handlers.size === 0) {
      console.log(`⚠️ No listeners for event: ${eventName}`)
      return
    }

    // Execute all handlers (in parallel for performance)
    const promises = Array.from(handlers).map(async (handler) => {
      try {
        await handler(payload)
      } catch (error) {
        console.error(`❌ Error in event handler for ${eventName}:`, error)
      }
    })

    await Promise.all(promises)
  }

  /**
   * Get event history (useful for debugging)
   */
  getHistory(): Array<{ event: SystemEventName; payload: any; timestamp: Date }> {
    return [...this.eventHistory]
  }

  /**
   * Clear all listeners (useful for testing)
   */
  clearAll(): void {
    this.listeners.clear()
    console.log("📡 All event listeners cleared")
  }

  /**
   * Get listener count for an event
   */
  getListenerCount(eventName: SystemEventName): number {
    return this.listeners.get(eventName)?.size || 0
  }
}

// Singleton instance
export const eventBus = new EventBus()
