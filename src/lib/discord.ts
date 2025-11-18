/**
 * Discord Webhook Helper with full Embed Support
 * Complete implementation for sending rich Discord notifications
 */

export interface DiscordEmbedField {
  name: string
  value: string
  inline?: boolean
}

export interface DiscordEmbed {
  title?: string
  description?: string
  url?: string
  color?: number
  fields?: DiscordEmbedField[]
  author?: {
    name: string
    url?: string
    icon_url?: string
  }
  thumbnail?: {
    url: string
  }
  image?: {
    url: string
  }
  footer?: {
    text: string
    icon_url?: string
  }
  timestamp?: string
}

export interface DiscordWebhookPayload {
  content?: string
  username?: string
  avatar_url?: string
  embeds?: DiscordEmbed[]
}

/**
 * Send a Discord webhook notification with optional embed
 * @param content - Plain text content (optional)
 * @param embed - Rich embed object (optional)
 * @returns Promise<boolean> - Success status
 */
export async function sendDiscordWebhook(
  content?: string,
  embed?: DiscordEmbed
): Promise<{ success: boolean; error?: string }> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

  if (!webhookUrl) {
    console.warn("⚠️ DISCORD_WEBHOOK_URL not configured in environment variables")
    return {
      success: false,
      error: "DISCORD_WEBHOOK_URL not configured",
    }
  }

  try {
    const payload: DiscordWebhookPayload = {
      username: "SaaS Bot",
    }

    if (content) {
      payload.content = content
    }

    if (embed) {
      payload.embeds = [embed]
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
      console.error("❌ Discord webhook failed:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      })

      return {
        success: false,
        error: `Discord API returned ${response.status}: ${response.statusText}`,
      }
    }

    console.log("✅ Discord notification sent successfully")
    return { success: true }
  } catch (error) {
    console.error("❌ Failed to send Discord webhook:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Send notification when a new category is created
 * @param category - Category data
 * @param userEmail - Email of the user who created it
 */
export async function notifyDiscordCategoryCreated(
  category: {
    id: string
    name: string
    slug: string
    userId: string
    createdAt: Date
    metadata?: any
  },
  userEmail: string
): Promise<{ success: boolean; error?: string }> {
  const embed: DiscordEmbed = {
    title: "📁 Category Created 🎉",
    description: "A new category was created in the system",
    color: 5814783, // Purple color as specified
    fields: [
      {
        name: "Name",
        value: category.name,
        inline: true,
      },
      {
        name: "ID",
        value: `\`${category.id}\``,
        inline: true,
      },
      {
        name: "Slug",
        value: `\`${category.slug}\``,
        inline: true,
      },
      {
        name: "User ID",
        value: `\`${category.userId}\``,
        inline: true,
      },
      {
        name: "User Email",
        value: userEmail,
        inline: true,
      },
      {
        name: "Created At",
        value: category.createdAt.toISOString(),
        inline: false,
      },
    ],
    timestamp: category.createdAt.toISOString(),
    footer: {
      text: "Discord SaaS Platform",
    },
  }

  // Add metadata field if present
  if (category.metadata) {
    embed.fields?.push({
      name: "Metadata",
      value: `\`\`\`json\n${JSON.stringify(category.metadata, null, 2)}\n\`\`\``,
      inline: false,
    })
  }

  return sendDiscordWebhook(undefined, embed)
}

/**
 * Test Discord webhook connection
 */
export async function testDiscordWebhook(): Promise<{
  success: boolean
  message: string
}> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

  if (!webhookUrl) {
    return {
      success: false,
      message: "DISCORD_WEBHOOK_URL is not configured",
    }
  }

  const embed: DiscordEmbed = {
    title: "🧪 Test Notification",
    description: "Discord webhook is working correctly!",
    color: 3066993, // Green
    timestamp: new Date().toISOString(),
  }

  const result = await sendDiscordWebhook("Test message from Discord SaaS", embed)

  return {
    success: result.success,
    message: result.success
      ? "Discord webhook test successful!"
      : result.error || "Unknown error",
  }
}
