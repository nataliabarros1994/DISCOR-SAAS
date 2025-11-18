/**
 * Stripe Price ID Mapping
 * Maps plan tiers and billing periods to their corresponding Stripe Price IDs
 */

export const stripePrices = {
  PRO: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID!,
    annual: process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID!,
  },
  ENTERPRISE: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID!,
    annual: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID!,
  },
} as const

export default stripePrices
