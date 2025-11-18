import { Resend } from "resend"

// Initialize Resend with API key
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function sendPaymentConfirmationEmail({
  to,
  customerName,
  amount,
  currency,
  transactionId,
}: {
  to: string
  customerName: string
  amount: number
  currency: string
  transactionId: string
}) {
  if (!resend) {
    console.warn("Resend is not configured. Skipping email sending.")
    return { success: false, error: "Email service not configured" }
  }

  try {
    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Discord SaaS <onboarding@resend.dev>",
      to: [to],
      subject: "Payment Confirmation - Welcome to Pro Plan!",
      html: generatePaymentEmailHTML({
        customerName,
        amount,
        currency,
        date,
        transactionId,
      }),
    })

    if (error) {
      console.error("Failed to send email:", error)
      return { success: false, error }
    }

    console.log("✅ Payment confirmation email sent to:", to)
    return { success: true, data }
  } catch (error) {
    console.error("Email sending error:", error)
    return { success: false, error }
  }
}

function generatePaymentEmailHTML({
  customerName,
  amount,
  currency,
  date,
  transactionId,
}: {
  customerName: string
  amount: number
  currency: string
  date: string
  transactionId: string
}) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Confirmation</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                <h1 style="color: white; font-size: 32px; margin: 0 0 10px 0; font-weight: bold;">Discord SaaS</h1>
                <p style="color: rgba(255, 255, 255, 0.9); margin: 0; font-size: 14px;">Event Tracking Platform</p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 40px 30px; background-color: #f9fafb;">
                <!-- Success Icon -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding-bottom: 30px;">
                      <div style="width: 64px; height: 64px; background-color: #d1fae5; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                        <span style="color: #10b981; font-size: 32px;">✓</span>
                      </div>
                    </td>
                  </tr>
                </table>

                <h2 style="color: #1f2937; font-size: 24px; text-align: center; margin: 0 0 20px 0;">Payment Successful!</h2>

                <p style="text-align: center; color: #6b7280; font-size: 16px; margin: 0 0 30px 0;">
                  Hi <strong>${customerName}</strong>, thank you for upgrading to Pro plan!
                </p>

                <!-- Payment Details -->
                <table width="100%" cellpadding="15" cellspacing="0" style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; margin: 25px 0;">
                  <tr style="border-bottom: 1px solid #f3f4f6;">
                    <td style="color: #6b7280; font-weight: 500;">Amount Paid</td>
                    <td align="right" style="color: #667eea; font-weight: 600; font-size: 24px;">
                      $${(amount / 100).toFixed(2)} ${currency.toUpperCase()}
                    </td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f3f4f6;">
                    <td style="color: #6b7280; font-weight: 500;">Date</td>
                    <td align="right" style="color: #1f2937; font-weight: 600;">${date}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f3f4f6;">
                    <td style="color: #6b7280; font-weight: 500;">Transaction ID</td>
                    <td align="right" style="color: #1f2937; font-weight: 600; font-size: 11px; font-family: monospace;">
                      ${transactionId}
                    </td>
                  </tr>
                  <tr>
                    <td style="color: #6b7280; font-weight: 500;">Plan</td>
                    <td align="right" style="color: #667eea; font-weight: 600;">Pro Plan</td>
                  </tr>
                </table>

                <!-- Features -->
                <table width="100%" cellpadding="20" cellspacing="0" style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; margin: 25px 0;">
                  <tr>
                    <td>
                      <h3 style="color: #166534; margin: 0 0 15px 0; font-size: 16px;">Your Pro Features Are Now Active:</h3>
                      <table width="100%" cellpadding="5" cellspacing="0">
                        <tr>
                          <td style="color: #166534;">
                            <span style="color: #16a34a; margin-right: 10px;">✓</span>
                            Unlimited Events
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #166534;">
                            <span style="color: #16a34a; margin-right: 10px;">✓</span>
                            Advanced Analytics
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #166534;">
                            <span style="color: #16a34a; margin-right: 10px;">✓</span>
                            Priority Support
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #166534;">
                            <span style="color: #16a34a; margin-right: 10px;">✓</span>
                            Discord Notifications
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- CTA Button -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding: 20px 0;">
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard"
                         style="display: inline-block; background-color: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                        Go to Dashboard
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
                  A notification has also been sent to your Discord server. You can start using all Pro features immediately!
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #1f2937; padding: 30px 20px; text-align: center;">
                <p style="color: #9ca3af; margin: 0 0 10px 0; font-size: 14px;">
                  If you have any questions, please contact us at
                  <a href="mailto:support@yourdomain.com" style="color: #667eea; text-decoration: none;">support@yourdomain.com</a>
                </p>
                <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                  Discord SaaS - Real-time Event Tracking
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `
}
