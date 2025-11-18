/**
 * Discord Webhook Utilities
 * Production-ready Discord notification system with comprehensive error handling
 */

interface DiscordEmbedField {
  name: string
  value: string
  inline?: boolean
}

interface DiscordEmbed {
  title?: string
  description?: string
  color?: number
  fields?: DiscordEmbedField[]
  timestamp?: string
  footer?: {
    text: string
  }
}

interface DiscordWebhookPayload {
  content?: string
  embeds?: DiscordEmbed[]
  username?: string
  avatar_url?: string
}

/**
 * Send notification to Discord when a user upgrades to PRO plan
 * @param userEmail - Email of the user who upgraded
 * @param userId - User ID from the database
 * @param clerkId - Clerk authentication ID
 * @param upgradeTimestamp - When the upgrade occurred
 */
export async function notifyDiscordOnUpgrade(
  userEmail: string,
  userId: string,
  clerkId: string,
  upgradeTimestamp: Date = new Date()
): Promise<{ success: boolean; error?: string }> {
  // Check if Discord webhook URL is configured
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn(
      "Discord webhook URL not configured. Skipping Discord notification."
    )
    return {
      success: false,
      error: "DISCORD_WEBHOOK_URL not configured",
    }
  }

  try {
    const payload: DiscordWebhookPayload = {
      username: "SaaS Bot",
      embeds: [
        {
          title: "🎉 New PRO Subscriber!",
          description: "A new user has upgraded to the PRO plan",
          color: 0x5865f2, // Discord blurple
          fields: [
            {
              name: "📧 Email",
              value: userEmail,
              inline: true,
            },
            {
              name: "🎫 Plan",
              value: "**PRO**",
              inline: true,
            },
            {
              name: "🆔 User ID",
              value: userId.substring(0, 12) + "...",
              inline: true,
            },
            {
              name: "⏰ Upgrade Time",
              value: upgradeTimestamp.toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "UTC",
              }) + " UTC",
              inline: false,
            },
          ],
          timestamp: upgradeTimestamp.toISOString(),
          footer: {
            text: "Discord SaaS Platform",
          },
        },
      ],
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Discord webhook error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      })

      return {
        success: false,
        error: `Discord API returned ${response.status}: ${response.statusText}`,
      }
    }

    console.log("✅ Discord notification sent successfully for user:", userEmail)

    return { success: true }
  } catch (error) {
    console.error("Failed to send Discord notification:", error)

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Send notification to Discord when a user is downgraded
 * @param userEmail - Email of the user who was downgraded
 * @param userId - User ID from the database
 * @param clerkId - Clerk authentication ID
 * @param reason - Reason for downgrade
 * @param timestamp - When the downgrade occurred
 */
export async function notifyDiscordOnDowngrade(
  userEmail: string,
  userId: string,
  clerkId: string,
  reason: string,
  timestamp: Date = new Date()
): Promise<{ success: boolean; error?: string }> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn("Discord webhook URL not configured. Skipping Discord notification.")
    return {
      success: false,
      error: "DISCORD_WEBHOOK_URL not configured",
    }
  }

  try {
    const payload: DiscordWebhookPayload = {
      username: "SaaS Bot",
      embeds: [
        {
          title: "⬇️ User Downgraded to FREE",
          description: "A user has been downgraded to the FREE plan",
          color: 0xe74c3c, // Red
          fields: [
            {
              name: "📧 Email",
              value: userEmail,
              inline: true,
            },
            {
              name: "🎫 New Plan",
              value: "**FREE**",
              inline: true,
            },
            {
              name: "❓ Reason",
              value: reason,
              inline: false,
            },
            {
              name: "🆔 User ID",
              value: userId.substring(0, 12) + "...",
              inline: true,
            },
            {
              name: "⏰ Time",
              value: timestamp.toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "UTC",
              }) + " UTC",
              inline: false,
            },
          ],
          timestamp: timestamp.toISOString(),
          footer: {
            text: "Discord SaaS Platform",
          },
        },
      ],
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Discord webhook error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      })

      return {
        success: false,
        error: `Discord API returned ${response.status}: ${response.statusText}`,
      }
    }

    console.log("✅ Discord downgrade notification sent successfully for user:", userEmail)

    return { success: true }
  } catch (error) {
    console.error("Failed to send Discord downgrade notification:", error)

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Send a general notification to Discord
 * @param message - The message to send
 * @param type - Type of notification (info, success, warning, error)
 */
export async function sendDiscordNotification(
  message: string,
  type: "info" | "success" | "warning" | "error" = "info"
): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn("Discord webhook URL not configured")
    return false
  }

  const colorMap = {
    info: 0x3498db, // Blue
    success: 0x2ecc71, // Green
    warning: 0xf39c12, // Orange
    error: 0xe74c3c, // Red
  }

  try {
    const payload: DiscordWebhookPayload = {
      embeds: [
        {
          description: message,
          color: colorMap[type],
          timestamp: new Date().toISOString(),
        },
      ],
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    return response.ok
  } catch (error) {
    console.error("Failed to send Discord notification:", error)
    return false
  }
}

/**
 * Send notification to Discord when a new category is created
 * @param categoryName - Name of the category
 * @param userEmail - Email of the user who created it
 * @param userId - User ID from the database
 */
export async function notifyDiscordOnCategoryCreated(
  categoryName: string,
  userEmail: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn("Discord webhook URL not configured. Skipping Discord notification.")
    return {
      success: false,
      error: "DISCORD_WEBHOOK_URL not configured",
    }
  }

  try {
    const payload: DiscordWebhookPayload = {
      username: "SaaS Bot",
      embeds: [
        {
          title: "📁 New Category Created",
          description: `A new category has been created: **${categoryName}**`,
          color: 0x9b59b6, // Purple
          fields: [
            {
              name: "📂 Category",
              value: categoryName,
              inline: true,
            },
            {
              name: "👤 User",
              value: userEmail,
              inline: true,
            },
            {
              name: "🆔 User ID",
              value: userId.substring(0, 12) + "...",
              inline: true,
            },
            {
              name: "⏰ Created At",
              value: new Date().toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "UTC",
              }) + " UTC",
              inline: false,
            },
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: "Discord SaaS Platform",
          },
        },
      ],
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Discord webhook error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      })

      return {
        success: false,
        error: `Discord API returned ${response.status}: ${response.statusText}`,
      }
    }

    console.log("✅ Discord category notification sent successfully:", categoryName)

    return { success: true }
  } catch (error) {
    console.error("Failed to send Discord category notification:", error)

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Test Discord webhook configuration
 * Useful for debugging and setup verification
 */
export async function testDiscordWebhook(): Promise<{
  success: boolean
  message: string
}> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

  if (!webhookUrl) {
    return {
      success: false,
      message: "DISCORD_WEBHOOK_URL is not configured in environment variables",
    }
  }

  try {
    const payload: DiscordWebhookPayload = {
      embeds: [
        {
          title: "🧪 Test Notification",
          description: "Discord webhook is configured correctly!",
          color: 0x2ecc71,
          timestamp: new Date().toISOString(),
        },
      ],
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      return {
        success: false,
        message: `Discord API error: ${response.status} ${response.statusText}`,
      }
    }

    return {
      success: true,
      message: "Discord webhook test successful!",
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
