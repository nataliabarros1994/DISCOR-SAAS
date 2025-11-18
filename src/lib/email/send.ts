import { Resend } from "resend"

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export interface SendEmailParams {
  to: string
  subject: string
  html: string
  text: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  // Check if Resend is configured
  if (!resend) {
    console.warn("⚠️ Resend is not configured. Email not sent:", { to, subject })
    return {
      success: false,
      error: "Email service not configured",
    }
  }

  try {
    console.log("📧 Sending email:", { to, subject })

    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Discord SaaS <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
      text,
    })

    console.log("✅ Email sent successfully:", data)

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error("❌ Failed to send email:", error)

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    }
  }
}
