import { PlanType } from "@prisma/client"

export type BillingPeriod = "MONTHLY" | "ANNUAL"

export function getPlanFromPriceId(priceId: string): PlanType {
  const proMonthly = process.env.STRIPE_PRO_MONTHLY_PRICE_ID
  const proAnnual = process.env.STRIPE_PRO_ANNUAL_PRICE_ID
  const enterpriseMonthly = process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID
  const enterpriseAnnual = process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID

  if (priceId === proMonthly || priceId === proAnnual) {
    return "PRO"
  }

  if (priceId === enterpriseMonthly || priceId === enterpriseAnnual) {
    return "ENTERPRISE"
  }

  return "FREE"
}

export function getBillingPeriod(priceId: string): BillingPeriod {
  const monthlyPrices = [
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
  ]

  if (monthlyPrices.includes(priceId)) {
    return "MONTHLY"
  }

  return "ANNUAL"
}

export function getPriceId(
  plan: PlanType,
  period: BillingPeriod
): string | null {
  if (plan === "PRO") {
    return period === "MONTHLY"
      ? process.env.STRIPE_PRO_MONTHLY_PRICE_ID!
      : process.env.STRIPE_PRO_ANNUAL_PRICE_ID!
  }

  if (plan === "ENTERPRISE") {
    return period === "MONTHLY"
      ? process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID!
      : process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID!
  }

  return null
}

/**
 * Calculate the billing cycle anchor timestamp for a given day of the month
 * @param preferredDay - Day of the month (1-28)
 * @returns Unix timestamp for the billing cycle anchor
 */
export function calculateBillingCycleAnchor(preferredDay: number): number {
  const now = new Date()
  const currentDay = now.getDate()

  let anchorDate: Date

  if (preferredDay > currentDay) {
    // Billing day is later this month
    anchorDate = new Date(now.getFullYear(), now.getMonth(), preferredDay)
  } else {
    // Billing day is next month
    anchorDate = new Date(now.getFullYear(), now.getMonth() + 1, preferredDay)
  }

  // Return Unix timestamp (seconds)
  return Math.floor(anchorDate.getTime() / 1000)
}

/**
 * Calculate proration for first charge based on billing day
 * @param basePrice - The monthly price
 * @param signupDate - Date of signup
 * @param preferredDay - Preferred billing day (1-28)
 * @returns Prorated amount for first charge
 */
export function calculateFirstCharge(
  basePrice: number,
  signupDate: Date,
  preferredDay: number
): number {
  const currentDay = signupDate.getDate()
  const daysInMonth = new Date(
    signupDate.getFullYear(),
    signupDate.getMonth() + 1,
    0
  ).getDate()

  let daysUntilBilling: number

  if (preferredDay > currentDay) {
    // Billing day is later this month
    daysUntilBilling = preferredDay - currentDay
  } else {
    // Billing day is next month
    daysUntilBilling = daysInMonth - currentDay + preferredDay
  }

  // Calculate prorated amount based on days
  const pricePerDay = basePrice / daysInMonth
  const proratedAmount = pricePerDay * daysUntilBilling

  return Math.round(proratedAmount * 100) / 100
}
