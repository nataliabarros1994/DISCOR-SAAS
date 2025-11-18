import { prisma } from "./prisma"
import { eventBus, SystemEventName, SystemEventMap } from "./event-bus"
import crypto from "crypto"

/**
 * WebhookDispatcher - Sends webhooks to user-configured endpoints with retry logic
 */
class WebhookDispatcher {
  private initialized = false
  private maxRetries = 5
  private retryDelays = [1000, 5000, 15000, 60000, 300000] // 1s, 5s, 15s, 1m, 5m

  /**
   * Initialize the webhook dispatcher
   * Subscribes to all system events and dispatches to user webhooks
   */
  initialize() {
    if (this.initialized) {
      console.log("⚠️ WebhookDispatcher already initialized")
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
      "payment.succeeded",
      "payment.failed",
    ]

    eventNames.forEach((eventName) => {
      eventBus.subscribe(eventName, async (payload) => {
        await this.dispatchWebhooks(eventName, payload)
      })

      console.log(`📡 Event listener registered for: ${eventName}`)
    })

    // Setup Discord notifications for event.created
    import("./discord-event-notifier").then(({ sendEventCreatedNotification }) => {
      eventBus.subscribe("event.created", async (payload) => {
        await sendEventCreatedNotification(payload)
      })
      console.log("📡 Discord notification listener registered for: event.created")
    })

    this.initialized = true
    console.log("✅ WebhookDispatcher initialized - listening to all events")
  }

  /**
   * Dispatch webhooks for an event
   */
  private async dispatchWebhooks<T extends SystemEventName>(
    eventName: T,
    payload: SystemEventMap[T]
  ): Promise<void> {
    try {
      // Find user webhooks that are listening to this event
      const webhooks = await prisma.userWebhook.findMany({
        where: {
          active: true,
          events: {
            has: eventName,
          },
        },
      })

      if (webhooks.length === 0) {
        return
      }

      console.log(`📤 Dispatching ${eventName} to ${webhooks.length} webhook(s)`)

      // Send to all webhooks in parallel
      await Promise.all(
        webhooks.map((webhook) => this.sendWebhook(webhook.id, eventName, payload))
      )
    } catch (error) {
      console.error(`❌ Error dispatching webhooks for ${eventName}:`, error)
    }
  }

  /**
   * Send a webhook with retry logic
   */
  async sendWebhook<T extends SystemEventName>(
    webhookId: string,
    eventName: T,
    payload: SystemEventMap[T],
    attemptCount = 1
  ): Promise<void> {
    try {
      const webhook = await prisma.userWebhook.findUnique({
        where: { id: webhookId },
      })

      if (!webhook || !webhook.active) {
        console.log(`⚠️ Webhook ${webhookId} not found or inactive`)
        return
      }

      // Generate HMAC signature
      const signature = this.generateSignature(payload, webhook.secret)

      // Prepare webhook payload
      const webhookPayload = {
        event: eventName,
        timestamp: new Date().toISOString(),
        data: payload,
      }

      // Send HTTP request
      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature,
          "X-Webhook-Event": eventName,
          "User-Agent": "DiscordSaaS-Webhook/1.0",
        },
        body: JSON.stringify(webhookPayload),
      })

      const responseBody = await response.text()

      if (response.ok) {
        // Success - log it
        await prisma.webhookLog.create({
          data: {
            webhookId,
            eventName,
            payload: webhookPayload as any,
            status: "success",
            httpStatus: response.status,
            responseBody: responseBody.slice(0, 1000), // Limit response body
            attemptCount,
          },
        })

        // Emit success event
        eventBus.emit("webhook.sent", {
          webhookId,
          userId: webhook.userId,
          eventName,
          status: "success",
          responseStatus: response.status,
        })

        console.log(`✅ Webhook sent successfully: ${webhook.name} (${eventName})`)
      } else {
        // Failed - retry if attempts remaining
        await this.handleWebhookFailure(
          webhookId,
          webhook,
          eventName,
          webhookPayload,
          response.status,
          responseBody,
          attemptCount
        )
      }
    } catch (error) {
      console.error(`❌ Error sending webhook ${webhookId}:`, error)

      // Network error - retry
      const webhook = await prisma.userWebhook.findUnique({
        where: { id: webhookId },
      })

      if (webhook) {
        await this.handleWebhookFailure(
          webhookId,
          webhook,
          eventName,
          { event: eventName, timestamp: new Date().toISOString(), data: payload },
          0,
          (error as Error).message,
          attemptCount
        )
      }
    }
  }

  /**
   * Handle webhook failure with retry logic
   */
  private async handleWebhookFailure(
    webhookId: string,
    webhook: any,
    eventName: string,
    payload: any,
    httpStatus: number,
    responseBody: string,
    attemptCount: number
  ): Promise<void> {
    if (attemptCount >= this.maxRetries) {
      // Max retries reached - log as failed
      await prisma.webhookLog.create({
        data: {
          webhookId,
          eventName,
          payload: payload as any,
          status: "failed",
          httpStatus: httpStatus || 0,
          responseBody: responseBody.slice(0, 1000),
          attemptCount,
        },
      })

      // Emit failure event
      eventBus.emit("webhook.sent", {
        webhookId,
        userId: webhook.userId,
        eventName,
        status: "failed",
        responseStatus: httpStatus,
      })

      console.error(
        `❌ Webhook failed after ${attemptCount} attempts: ${webhook.name} (${eventName})`
      )
    } else {
      // Schedule retry
      const nextRetryDelay = this.retryDelays[attemptCount - 1] || this.retryDelays[this.retryDelays.length - 1]
      const nextRetryAt = new Date(Date.now() + nextRetryDelay)

      await prisma.webhookLog.create({
        data: {
          webhookId,
          eventName,
          payload: payload as any,
          status: "retrying",
          httpStatus: httpStatus || 0,
          responseBody: responseBody.slice(0, 1000),
          attemptCount,
          nextRetryAt,
        },
      })

      console.log(
        `🔄 Webhook retry scheduled (attempt ${attemptCount + 1}/${this.maxRetries}): ${webhook.name} in ${nextRetryDelay}ms`
      )

      // Schedule retry
      setTimeout(() => {
        this.sendWebhook(webhookId, eventName as SystemEventName, payload.data, attemptCount + 1)
      }, nextRetryDelay)
    }
  }

  /**
   * Generate HMAC-SHA256 signature for webhook validation
   */
  private generateSignature(payload: any, secret: string): string {
    const hmac = crypto.createHmac("sha256", secret)
    hmac.update(JSON.stringify(payload))
    return hmac.digest("hex")
  }

  /**
   * Manually trigger a webhook (for testing)
   */
  async triggerWebhook(webhookId: string, eventName: SystemEventName, payload: any) {
    await this.sendWebhook(webhookId, eventName, payload)
  }

  /**
   * Process pending webhook retries
   * This should be called periodically (e.g., every minute via cron)
   */
  async processRetries() {
    const now = new Date()

    const pendingRetries = await prisma.webhookLog.findMany({
      where: {
        status: "retrying",
        nextRetryAt: {
          lte: now,
        },
      },
      include: {
        webhook: true,
      },
    })

    console.log(`🔄 Processing ${pendingRetries.length} pending webhook retries`)

    for (const log of pendingRetries) {
      if (!log.webhook.active) {
        // Webhook was deactivated - mark as failed
        await prisma.webhookLog.update({
          where: { id: log.id },
          data: { status: "failed" },
        })
        continue
      }

      // Retry the webhook
      await this.sendWebhook(
        log.webhookId,
        log.eventName as SystemEventName,
        log.payload,
        log.attemptCount + 1
      )
    }
  }
}

// Singleton instance
export const webhookDispatcher = new WebhookDispatcher()
