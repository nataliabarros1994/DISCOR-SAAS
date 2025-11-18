/**
 * Server-side initialization
 * This file should only be imported by server components
 */

import { eventTracker } from "./event-tracker"
import { webhookDispatcher } from "./webhook-dispatcher"

let initialized = false

export function initializeServer() {
  if (initialized) {
    return
  }

  initialized = true

  // Initialize EventTracker
  eventTracker.initialize()

  // Initialize WebhookDispatcher (includes Discord notifications)
  webhookDispatcher.initialize()

  console.log("✅ Server initialized")
}
