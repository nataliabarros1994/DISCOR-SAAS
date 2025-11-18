"use client"

import { Check } from "lucide-react"
import { PlanConfig } from "@/lib/plans"
import { PlanType } from "@prisma/client"

interface PricingCardProps {
  plan: PlanConfig
  billingPeriod: "monthly" | "annual"
  currentPlan?: PlanType
  onSelectPlan: () => void
  isLoading?: boolean
}

export function PricingCard({
  plan,
  billingPeriod,
  currentPlan,
  onSelectPlan,
  isLoading = false,
}: PricingCardProps) {
  const price =
    billingPeriod === "monthly" ? plan.monthlyPrice : plan.annualPrice / 12
  const totalPrice =
    billingPeriod === "monthly" ? plan.monthlyPrice : plan.annualPrice
  const isCurrentPlan = currentPlan === plan.id
  const isFree = plan.id === "FREE"

  // Determine if this is an upgrade or downgrade
  const planOrder: Record<string, number> = { FREE: 0, PRO: 1, ENTERPRISE: 2 }
  const currentPlanOrder = currentPlan ? planOrder[currentPlan] : 0
  const thisPlanOrder = planOrder[plan.id]
  const isUpgrade = thisPlanOrder > currentPlanOrder
  const isDowngrade = thisPlanOrder < currentPlanOrder && !isFree

  return (
    <div
      className={`relative rounded-2xl border-2 p-8 shadow-lg transition-all hover:scale-105 ${
        plan.popular
          ? "border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20"
          : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
      }`}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-1 text-sm font-semibold text-white">
            Most Popular
          </span>
        </div>
      )}

      {/* Plan Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {plan.name}
        </h3>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-5xl font-bold text-gray-900 dark:text-white">
            ${price.toFixed(2)}
          </span>
          <span className="text-gray-500 dark:text-gray-400">/month</span>
        </div>
        {billingPeriod === "annual" && plan.annualDiscount && (
          <div className="mt-2">
            <span className="text-sm text-green-600 dark:text-green-400">
              Save {plan.annualDiscount}% (${totalPrice.toFixed(2)}/year)
            </span>
          </div>
        )}
      </div>

      {/* Status Message - Always rendered to avoid hydration issues */}
      <div className="mb-6">
        {isCurrentPlan ? (
          <div className="rounded-lg bg-green-100 p-3 text-center dark:bg-green-900/20">
            <span className="text-sm font-semibold text-green-700 dark:text-green-400">
              ✓ Your Current Plan
            </span>
          </div>
        ) : !isFree ? (
          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <span className="text-xs text-blue-700 dark:text-blue-400">
              {isUpgrade
                ? "Upgrade to unlock more features"
                : "Contact support to downgrade"}
            </span>
          </div>
        ) : (
          <div className="h-12" /> // Spacer for Free plan
        )}
      </div>

      {/* CTA Button */}
      <button
        onClick={onSelectPlan}
        disabled={isCurrentPlan || (isFree && !isCurrentPlan) || (isLoading ?? false)}
        className={`mb-6 w-full rounded-lg px-6 py-3 font-semibold transition-colors ${
          isCurrentPlan
            ? "cursor-not-allowed bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
            : isFree
              ? "cursor-not-allowed bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              : plan.popular
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                : "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
        }`}
      >
        {(isLoading ?? false)
          ? "Processing..."
          : isCurrentPlan
            ? "Current Plan"
            : isFree
              ? "Free Plan"
              : isUpgrade
                ? "Upgrade Now"
                : "Change Plan"}
      </button>

      {/* Features List */}
      <div className="space-y-4">
        <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
          <h4 className="mb-3 text-sm font-semibold uppercase text-gray-700 dark:text-gray-300">
            Features
          </h4>
          <ul className="space-y-3">
            {plan.features
              .filter((f) => f.included)
              .map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                  <div className="flex-1">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {feature.name}
                    </span>
                    {feature.limit && (
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        ({feature.limit})
                      </span>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        </div>

        {/* Limits */}
        <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
          <h4 className="mb-3 text-sm font-semibold uppercase text-gray-700 dark:text-gray-300">
            Limits
          </h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li>
              Events:{" "}
              <span className="font-semibold">{plan.limits.events}</span>
            </li>
            <li>
              Categories:{" "}
              <span className="font-semibold">{plan.limits.categories}</span>
            </li>
            <li>
              API Calls:{" "}
              <span className="font-semibold">
                {plan.limits.apiCalls === 0
                  ? "None"
                  : plan.limits.apiCalls === "unlimited"
                    ? "Unlimited"
                    : `${plan.limits.apiCalls.toLocaleString()}/month`}
              </span>
            </li>
            <li>
              Team:{" "}
              <span className="font-semibold">
                {plan.limits.teamMembers === "unlimited"
                  ? "Unlimited"
                  : `${plan.limits.teamMembers} ${plan.limits.teamMembers === 1 ? "member" : "members"}`}
              </span>
            </li>
            <li>
              Retention:{" "}
              <span className="font-semibold">{plan.limits.dataRetention}</span>
            </li>
            <li>
              Support: <span className="font-semibold">{plan.limits.support}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
