import { PlanType } from "@prisma/client"

interface UpgradeConfirmationEmailProps {
  userName: string
  plan: PlanType
  billingPeriod: "monthly" | "annual"
  amount: number
  nextBillingDate: string
}

export function getUpgradeConfirmationEmail({
  userName,
  plan,
  billingPeriod,
  amount,
  nextBillingDate,
}: UpgradeConfirmationEmailProps) {
  const planNames = {
    FREE: "Free",
    PRO: "Pro",
    ENTERPRISE: "Enterprise",
  }

  const planName = planNames[plan]
  const periodText = billingPeriod === "monthly" ? "mensal" : "anual"

  return {
    subject: `✅ Upgrade Confirmado - Plano ${planName}`,
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Upgrade Confirmado</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                🎉 Upgrade Confirmado!
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 24px;">
                Olá <strong>${userName}</strong>,
              </p>

              <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 24px;">
                Parabéns! Seu upgrade para o plano <strong style="color: #667eea;">${planName}</strong> foi confirmado com sucesso! 🚀
              </p>

              <!-- Plan Details Card -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0; background-color: #f9fafb; border-radius: 8px; border: 2px solid #e5e7eb;">
                <tr>
                  <td style="padding: 24px;">
                    <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px; font-weight: 600;">
                      Detalhes da Assinatura
                    </h2>

                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong>Plano:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">
                          ${planName}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong>Período:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">
                          Cobrança ${periodText}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">
                          <strong>Valor:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right;">
                          <strong style="color: #059669; font-size: 16px;">$${amount.toFixed(2)}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">
                          <strong>Próxima cobrança:</strong>
                        </td>
                        <td style="padding: 8px 0; color: #111827; font-size: 14px; text-align: right; border-top: 1px solid #e5e7eb;">
                          ${nextBillingDate}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Benefits -->
              <h3 style="margin: 30px 0 16px; color: #111827; font-size: 18px; font-weight: 600;">
                ✨ O que você ganhou:
              </h3>

              <ul style="margin: 0; padding: 0 0 0 20px; color: #374151; font-size: 14px; line-height: 24px;">
                ${plan === "PRO" ? `
                  <li style="margin-bottom: 8px;">Eventos ilimitados</li>
                  <li style="margin-bottom: 8px;">Categorias ilimitadas</li>
                  <li style="margin-bottom: 8px;">Analytics avançados</li>
                  <li style="margin-bottom: 8px;">Acesso à API (10,000 chamadas/mês)</li>
                  <li style="margin-bottom: 8px;">Retenção de dados por 90 dias</li>
                  <li style="margin-bottom: 8px;">Suporte prioritário (12h)</li>
                ` : `
                  <li style="margin-bottom: 8px;">Tudo ilimitado - sem restrições!</li>
                  <li style="margin-bottom: 8px;">API sem limites de chamadas</li>
                  <li style="margin-bottom: 8px;">Retenção de dados vitalícia</li>
                  <li style="margin-bottom: 8px;">Membros ilimitados na equipe</li>
                  <li style="margin-bottom: 8px;">Gerente de conta dedicado</li>
                  <li style="margin-bottom: 8px;">Suporte 24/7 (resposta em 1h)</li>
                  <li style="margin-bottom: 8px;">SLA 99.9% garantido</li>
                `}
              </ul>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard"
                       style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Acessar Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Support Info -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0; background-color: #eff6ff; border-radius: 6px; border-left: 4px solid #3b82f6;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 20px;">
                      <strong>💡 Dica:</strong> Você pode gerenciar sua assinatura, atualizar método de pagamento ou cancelar a qualquer momento em
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/manage" style="color: #2563eb; text-decoration: underline;">Gerenciar Assinatura</a>.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0; color: #374151; font-size: 14px; line-height: 22px;">
                Obrigado por escolher nosso serviço! Se tiver alguma dúvida, estamos aqui para ajudar.
              </p>

              <p style="margin: 16px 0 0; color: #374151; font-size: 14px; line-height: 22px;">
                Atenciosamente,<br>
                <strong>Equipe Discord SaaS</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; line-height: 18px;">
                Este é um email automático. Por favor, não responda.
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 18px;">
                © ${new Date().getFullYear()} Discord SaaS. Todos os direitos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `
Olá ${userName},

Parabéns! Seu upgrade para o plano ${planName} foi confirmado com sucesso!

DETALHES DA ASSINATURA
======================
Plano: ${planName}
Período: Cobrança ${periodText}
Valor: $${amount.toFixed(2)}
Próxima cobrança: ${nextBillingDate}

O QUE VOCÊ GANHOU:
${plan === "PRO" ? `
- Eventos ilimitados
- Categorias ilimitadas
- Analytics avançados
- Acesso à API (10,000 chamadas/mês)
- Retenção de dados por 90 dias
- Suporte prioritário (12h)
` : `
- Tudo ilimitado - sem restrições!
- API sem limites de chamadas
- Retenção de dados vitalícia
- Membros ilimitados na equipe
- Gerente de conta dedicado
- Suporte 24/7 (resposta em 1h)
- SLA 99.9% garantido
`}

Acesse seu dashboard: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard

Gerencie sua assinatura: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/manage

Obrigado por escolher nosso serviço!

Atenciosamente,
Equipe Discord SaaS
    `,
  }
}
