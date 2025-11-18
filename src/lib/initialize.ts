import { eventTracker } from "./event-tracker"
import { webhookDispatcher } from "./webhook-dispatcher"
import { initializeDefaultQuotas } from "./quota-enforcement"

/**
 * Initialize all system services
 * Should be called once when the application starts
 */
export async function initializeApp() {
  try {
    console.log("🚀 Initializing Discord SaaS application...")

    // Initialize EventTracker (subscribes to all events and logs to database)
    eventTracker.initialize()

    // Initialize WebhookDispatcher (subscribes to events and sends to user webhooks)
    webhookDispatcher.initialize()

    // Initialize default quotas in database
    await initializeDefaultQuotas()

    console.log("✅ Application initialized successfully!")
  } catch (error) {
    console.error("❌ Failed to initialize application:", error)
    // Don't throw - allow app to start even if initialization fails
  }
}
