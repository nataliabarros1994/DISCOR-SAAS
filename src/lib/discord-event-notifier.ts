/**
 * Discord Event Notifier
 * Sends Discord notifications when events are created
 */

import { SystemEventMap } from "./event-bus"

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL

/**
 * Send Discord notification for event.created
 */
export async function sendEventCreatedNotification(
  payload: SystemEventMap["event.created"]
): Promise<void> {
  if (!DISCORD_WEBHOOK_URL) {
    console.warn("⚠️ DISCORD_WEBHOOK_URL not configured, skipping notification")
    return
  }

  try {
    // Format the scheduled date/time if available
    let scheduledText = "Sem data agendada"
    if (payload.scheduledFor) {
      const scheduledDate = new Date(payload.scheduledFor)
      const dateStr = scheduledDate.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      const timeStr = scheduledDate.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
      scheduledText = `${dateStr} às ${timeStr}`
    }

    const embed = {
      title: "📅 Evento Criado! 🎉",
      description: `Um novo evento foi adicionado ao sistema`,
      color: 0x3b82f6, // Blue color
      fields: [
        {
          name: "📌 Título",
          value: payload.eventTitle,
          inline: false,
        },
        ...(payload.eventDescription
          ? [
              {
                name: "📝 Descrição",
                value: payload.eventDescription,
                inline: false,
              },
            ]
          : []),
        {
          name: "🗓️ Data e Hora Agendada",
          value: scheduledText,
          inline: false,
        },
        {
          name: "📁 Categoria",
          value: `${payload.categoryName} (\`${payload.categorySlug}\`)`,
          inline: true,
        },
        {
          name: "🔖 ID do Evento",
          value: `\`${payload.eventId}\``,
          inline: true,
        },
        {
          name: "👤 Usuário",
          value: payload.userEmail,
          inline: false,
        },
        {
          name: "⏰ Criado em",
          value: new Date().toLocaleString("pt-BR"),
          inline: false,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: "Discord SaaS - Sistema de Eventos",
      },
    }

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [embed],
      }),
    })

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status} ${response.statusText}`)
    }

    console.log("✅ Discord notification sent successfully for event:", payload.eventTitle)
  } catch (error) {
    console.error("❌ Failed to send Discord notification:", error)
    // Don't throw - we don't want to fail event creation if notification fails
  }
}
