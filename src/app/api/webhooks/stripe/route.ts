import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"
import { eventBus } from "@/lib/event-bus"

// Initialize Stripe only if API key is available
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-10-29.clover",
    })
  : null

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe || !webhookSecret) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 503 }
      )
    }

    const body = await req.text()
    const signature = (await headers()).get("stripe-signature")

    if (!signature) {
      return NextResponse.json(
        { error: "No signature found" },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message)
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      )
    }

    // Idempotency check - verify if event was already processed
    const existingEvent = await prisma.stripeEvent.findUnique({
      where: { eventId: event.id },
    })

    if (existingEvent) {
      console.log(`Event ${event.id} already processed, skipping...`)
      return NextResponse.json({ received: true, skipped: true })
    }

    // Record event as processed (before processing to prevent race conditions)
    await prisma.stripeEvent.create({
      data: {
        eventId: event.id,
        eventType: event.type,
        processed: true,
      },
    })

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        if (userId && session.mode === "subscription" && session.subscription) {
          // For subscription mode, we'll handle this in customer.subscription.created
          console.log(`Checkout session completed for subscription: ${session.subscription}`)
        } else if (userId) {
          // Legacy one-time payment support
          const plan = (session.metadata?.plan as any) || "PRO"
          const user = await prisma.user.update({
            where: { id: userId },
            data: { plan },
          })

          // Send notifications
          try {
            const { notifyDiscordOnUpgrade } = await import("@/lib/discord-webhook")
            await notifyDiscordOnUpgrade(
              user.email,
              user.id,
              session.metadata?.clerkId || "unknown",
              new Date()
            )
          } catch (discordError) {
            console.error("Failed to send Discord notification:", discordError)
          }

          try {
            const { sendPaymentConfirmationEmail } = await import("@/lib/resend")
            await sendPaymentConfirmationEmail({
              to: user.email,
              customerName: user.email.split("@")[0],
              amount: session.amount_total || 999,
              currency: session.currency || "usd",
              transactionId: session.id,
            })
          } catch (emailError) {
            console.error("Failed to send email notification:", emailError)
          }

          console.log(`User ${userId} upgraded to ${plan} plan`)
        }
        break
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const priceId = subscription.items.data[0]?.price.id

        if (!priceId) break

        const { getPlanFromPriceId, getBillingPeriod } = await import("@/lib/stripe-helpers")
        const plan = getPlanFromPriceId(priceId)
        const billingPeriod = getBillingPeriod(priceId)

        // Find user by Stripe customer ID
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (user) {
          // Fetch full subscription details to ensure we have all properties
          const fullSubscription: any = await stripe.subscriptions.retrieve(subscription.id)

          // Get billing day from metadata if available
          const preferredBillingDay = fullSubscription.metadata?.preferredBillingDay
            ? parseInt(fullSubscription.metadata.preferredBillingDay)
            : undefined

          // Update user with subscription details - handle undefined period values
          const currentPeriodStart = fullSubscription.current_period_start
          const currentPeriodEnd = fullSubscription.current_period_end
          const trialEnd = fullSubscription.trial_end

          const periodStart = currentPeriodStart && !isNaN(currentPeriodStart)
            ? new Date(currentPeriodStart * 1000)
            : new Date()

          const periodEnd = currentPeriodEnd && !isNaN(currentPeriodEnd)
            ? new Date(currentPeriodEnd * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

          const trialEndDate = trialEnd && !isNaN(trialEnd)
            ? new Date(trialEnd * 1000)
            : null

          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan,
              stripeSubscriptionId: fullSubscription.id,
              stripeSubscriptionStatus: fullSubscription.status as any,
              stripePriceId: priceId,
              subscriptionPeriod: billingPeriod,
              currentPeriodStart: periodStart,
              currentPeriodEnd: periodEnd,
              nextBillingDate: trialEndDate || periodEnd,
              trialEnd: trialEndDate,
              preferredBillingDay,
            },
          })

          // Send upgrade confirmation email
          try {
            const { sendEmail } = await import("@/lib/email/send")
            const { getUpgradeConfirmationEmail } = await import("@/lib/email/templates")

            const amount = (subscription.items.data[0].price.unit_amount || 0) / 100
            const nextBillingDate = periodEnd.toLocaleDateString("pt-BR")

            const emailContent = getUpgradeConfirmationEmail({
              userName: user.email.split("@")[0],
              plan,
              billingPeriod: billingPeriod.toLowerCase() as "monthly" | "annual",
              amount,
              nextBillingDate,
            })

            await sendEmail({
              to: user.email,
              subject: emailContent.subject,
              html: emailContent.html,
              text: emailContent.text,
            })
          } catch (emailError) {
            console.error("Failed to send upgrade confirmation email:", emailError)
          }

          try {
            const { notifyDiscordOnUpgrade } = await import("@/lib/discord-webhook")
            await notifyDiscordOnUpgrade(
              user.email,
              user.id,
              user.clerkId,
              new Date()
            )
          } catch (discordError) {
            console.error("Failed to send Discord notification:", discordError)
          }

          // Emit user.plan.upgraded event
          eventBus.emit("user.plan.upgraded", {
            userId: user.id,
            userEmail: user.email,
            fromPlan: "FREE",
            toPlan: plan,
            billingPeriod: billingPeriod,
            stripeSubscriptionId: fullSubscription.id,
          })

          console.log(`Subscription created for user ${user.id}: ${plan} (${billingPeriod})`)
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription: any = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const priceId = subscription.items.data[0]?.price.id

        if (!priceId) break

        const { getPlanFromPriceId, getBillingPeriod } = await import("@/lib/stripe-helpers")
        const plan = getPlanFromPriceId(priceId)
        const billingPeriod = getBillingPeriod(priceId)

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (user) {
          const currentPeriodStart = subscription.current_period_start
          const currentPeriodEnd = subscription.current_period_end
          const canceledAt = subscription.canceled_at

          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan,
              stripeSubscriptionStatus: subscription.status,
              stripePriceId: priceId,
              subscriptionPeriod: billingPeriod,
              currentPeriodStart: currentPeriodStart && !isNaN(currentPeriodStart)
                ? new Date(currentPeriodStart * 1000)
                : new Date(),
              currentPeriodEnd: currentPeriodEnd && !isNaN(currentPeriodEnd)
                ? new Date(currentPeriodEnd * 1000)
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              nextBillingDate: currentPeriodEnd && !isNaN(currentPeriodEnd)
                ? new Date(currentPeriodEnd * 1000)
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
              canceledAt: canceledAt ? new Date(canceledAt * 1000) : null,
            },
          })

          console.log(`Subscription updated for user ${user.id}: ${subscription.status}`)
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription: any = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (user) {
          const canceledPlan = user.plan // Salvar plano antes de fazer downgrade

          // Downgrade to FREE plan
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan: "FREE",
              stripeSubscriptionStatus: "canceled",
              stripeSubscriptionId: null,
              stripePriceId: null,
              subscriptionPeriod: null,
              currentPeriodStart: null,
              currentPeriodEnd: null,
              nextBillingDate: null,
              cancelAtPeriodEnd: false,
              canceledAt: new Date(),
            },
          })

          // Send cancellation confirmation email
          try {
            const { sendEmail } = await import("@/lib/email/send")

            const cancelDate = new Date().toLocaleDateString("pt-BR")

            await sendEmail({
              to: user.email,
              subject: "❌ Cancelamento Confirmado",
              html: `
                <h1>Seu plano foi cancelado</h1>
                <p>Olá ${user.email.split("@")[0]},</p>
                <p>Confirmamos o cancelamento da sua assinatura do plano <strong>${canceledPlan}</strong> em ${cancelDate}.</p>

                <h2>O que acontece agora?</h2>
                <ul>
                  <li>✅ Sua conta foi alterada para o <strong>plano GRATUITO</strong></li>
                  <li>✅ Você não será mais cobrado</li>
                  <li>⚠️ Acesso aos recursos ${canceledPlan} foi removido</li>
                </ul>

                <h2>Características do plano gratuito:</h2>
                <ul>
                  <li>100 eventos por mês</li>
                  <li>3 categorias</li>
                  <li>Retenção de dados por 7 dias</li>
                  <li>Notificações básicas do Discord</li>
                </ul>

                <p>Sentiremos sua falta! 😢</p>
                <p>Se você mudou de ideia, pode reativar sua assinatura a qualquer momento acessando nossa <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing">página de preços</a>.</p>

                <p><strong>Obrigado por ter usado nosso serviço!</strong></p>
                <p>Se tiver algum feedback, adoraríamos ouvir de você.</p>
              `,
              text: `Seu plano ${canceledPlan} foi cancelado em ${cancelDate}. Sua conta foi alterada para o plano GRATUITO. Você não será mais cobrado.`,
            })

            console.log(`Cancellation email sent to user ${user.id}`)
          } catch (emailError) {
            console.error("Failed to send cancellation email:", emailError)
          }

          // Notify Discord
          try {
            const { notifyDiscordOnDowngrade } = await import("@/lib/discord-webhook")
            await notifyDiscordOnDowngrade(
              user.email,
              user.id,
              user.clerkId,
              `Cancelamento de assinatura ${canceledPlan}`,
              new Date()
            )
          } catch (discordError) {
            console.error("Failed to send Discord notification:", discordError)
          }

          // Emit user.plan.canceled event
          eventBus.emit("user.plan.canceled", {
            userId: user.id,
            userEmail: user.email,
            plan: canceledPlan,
            canceledAt: new Date(),
          })

          console.log(`Subscription deleted for user ${user.id} - downgraded to FREE`)
        }
        break
      }

      case "invoice.payment_succeeded": {
        const invoice: any = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        const subscriptionId = invoice.subscription as string

        if (!subscriptionId) break

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (user) {
          // Get subscription to update next billing date
          const subscription: any = await stripe.subscriptions.retrieve(subscriptionId)
          const currentPeriodEnd = subscription.current_period_end

          await prisma.user.update({
            where: { id: user.id },
            data: {
              nextBillingDate: currentPeriodEnd && !isNaN(currentPeriodEnd)
                ? new Date(currentPeriodEnd * 1000)
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              lastReminderSent: null, // Reset reminder for next cycle
            },
          })

          // Send payment success email
          try {
            const { sendPaymentConfirmationEmail } = await import("@/lib/resend")
            await sendPaymentConfirmationEmail({
              to: user.email,
              customerName: user.email.split("@")[0],
              amount: invoice.amount_paid,
              currency: invoice.currency || "usd",
              transactionId: invoice.id,
            })
          } catch (emailError) {
            console.error("Failed to send payment success email:", emailError)
          }

          // Emit payment.succeeded event
          eventBus.emit("payment.succeeded", {
            userId: user.id,
            amount: invoice.amount_paid / 100, // Convert cents to dollars
            currency: invoice.currency || "usd",
            stripePaymentId: invoice.id,
          })

          console.log(`Payment succeeded for user ${user.id}`)
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (user) {
          // Update subscription status
          await prisma.user.update({
            where: { id: user.id },
            data: {
              stripeSubscriptionStatus: "past_due",
            },
          })

          // Emit payment.failed event
          eventBus.emit("payment.failed", {
            userId: user.id,
            amount: (invoice.amount_due || 0) / 100,
            currency: invoice.currency || "usd",
            reason: "Payment failed",
          })

          console.log(`Payment failed for user ${user.id}`)
        }
        break
      }

      case "invoice.upcoming": {
        // This webhook fires ~7 days before renewal
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (user) {
          // Send reminder email (we'll create this function later)
          console.log(`Upcoming invoice for user ${user.id} - send reminder email`)
        }
        break
      }

      case "customer.subscription.trial_will_end": {
        // This webhook fires 3 days before trial ends
        const subscription: any = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (user) {
          try {
            const { sendEmail } = await import("@/lib/email/send")

            const trialEndDate = subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toLocaleDateString("pt-BR")
              : "em breve"

            await sendEmail({
              to: user.email,
              subject: "⏰ Seu período de teste termina em 3 dias",
              html: `
                <h1>Seu período de teste está terminando</h1>
                <p>Olá ${user.email.split("@")[0]},</p>
                <p>Seu período de teste gratuito de 7 dias do plano <strong>${user.plan}</strong> termina em ${trialEndDate}.</p>
                <p>Após essa data, sua assinatura será renovada automaticamente e seu cartão será cobrado.</p>
                <p>Se você deseja cancelar, acesse sua conta antes do término do período de teste.</p>
                <p><strong>Valor da cobrança:</strong> Conforme o plano selecionado</p>
                <p>Obrigado por usar nosso serviço!</p>
              `,
              text: `Seu período de teste termina em ${trialEndDate}. Após essa data sua assinatura será renovada automaticamente.`,
            })

            console.log(`Trial ending reminder sent to user ${user.id}`)
          } catch (emailError) {
            console.error("Failed to send trial ending reminder:", emailError)
          }
        }
        break
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`PaymentIntent successful: ${paymentIntent.id}`)
        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`PaymentIntent failed: ${paymentIntent.id}`)
        break
      }

      case "charge.refunded": {
        // When a refund is issued, downgrade user to FREE plan
        const charge: any = event.data.object as Stripe.Charge
        const customerId = charge.customer as string

        if (!customerId) break

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (user) {
          // Downgrade to FREE plan and cancel subscription
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan: "FREE",
              stripeSubscriptionStatus: "canceled",
              stripeSubscriptionId: null,
              stripePriceId: null,
              subscriptionPeriod: null,
              currentPeriodStart: null,
              currentPeriodEnd: null,
              nextBillingDate: null,
              cancelAtPeriodEnd: false,
              canceledAt: new Date(),
            },
          })

          // Send refund confirmation email
          try {
            const { sendEmail } = await import("@/lib/email/send")

            await sendEmail({
              to: user.email,
              subject: "✅ Reembolso Processado",
              html: `
                <h1>Seu reembolso foi processado</h1>
                <p>Olá ${user.email.split("@")[0]},</p>
                <p>Seu reembolso foi processado com sucesso.</p>
                <p>Valor reembolsado: ${(charge.amount_refunded / 100).toFixed(2)} ${charge.currency.toUpperCase()}</p>
                <p><strong>Importante:</strong> Sua conta foi automaticamente alterada para o plano GRATUITO.</p>
                <p>Características do plano gratuito:</p>
                <ul>
                  <li>100 eventos por mês</li>
                  <li>3 categorias</li>
                  <li>Retenção de dados por 7 dias</li>
                </ul>
                <p>Se você gostaria de voltar a um plano pago, acesse nossa página de preços.</p>
                <p>Obrigado por usar nosso serviço!</p>
              `,
              text: `Seu reembolso de ${(charge.amount_refunded / 100).toFixed(2)} ${charge.currency.toUpperCase()} foi processado. Sua conta foi alterada para o plano GRATUITO.`,
            })

            console.log(`Refund email sent to user ${user.id}`)
          } catch (emailError) {
            console.error("Failed to send refund email:", emailError)
          }

          // Notify Discord
          try {
            const { notifyDiscordOnDowngrade } = await import("@/lib/discord-webhook")
            await notifyDiscordOnDowngrade(
              user.email,
              user.id,
              user.clerkId,
              "Reembolso processado",
              new Date()
            )
          } catch (discordError) {
            console.error("Failed to send Discord notification:", discordError)
          }

          console.log(`User ${user.id} downgraded to FREE due to refund`)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}
