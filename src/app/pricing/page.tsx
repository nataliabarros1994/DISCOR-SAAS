"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { PricingCard } from "@/components/PricingCard"
import { PricingToggle } from "@/components/PricingToggle"
import { FeatureComparison } from "@/components/FeatureComparison"
import { PLANS, type PlanTier } from "@/lib/plans"

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly")
  const [currentPlan, setCurrentPlan] = useState<PlanTier>("FREE")
  const router = useRouter()
  const { isSignedIn } = useAuth()

  // Fetch current user plan
  useEffect(() => {
    const fetchCurrentPlan = async () => {
      if (!isSignedIn) return

      try {
        const response = await fetch("/api/user/plan")
        if (response.ok) {
          const data = await response.json()
          setCurrentPlan(data.plan || "FREE")
        }
      } catch (error) {
        console.error("Error fetching user plan:", error)
      }
    }

    fetchCurrentPlan()
  }, [isSignedIn])

  const handleSelectPlan = async (planId: PlanTier) => {
    if (planId === "FREE") {
      return
    }

    if (!isSignedIn) {
      router.push("/sign-in?redirect_url=/pricing")
      return
    }

    // Redirect to checkout page where user can select billing period and date
    router.push(`/checkout?plan=${planId}&period=${billingPeriod}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">
            Pricing
          </h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Choose the perfect plan for your needs
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Start for free, upgrade as you grow. All plans include our core features.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mt-16 flex justify-center">
          <PricingToggle period={billingPeriod} onChange={setBillingPeriod} />
        </div>

        {/* Pricing Cards */}
        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          <PricingCard
            plan={PLANS.FREE}
            billingPeriod={billingPeriod}
            currentPlan={currentPlan}
            onSelectPlan={() => handleSelectPlan("FREE")}
          />
          <PricingCard
            plan={PLANS.PRO}
            billingPeriod={billingPeriod}
            currentPlan={currentPlan}
            onSelectPlan={() => handleSelectPlan("PRO")}
          />
          <PricingCard
            plan={PLANS.ENTERPRISE}
            billingPeriod={billingPeriod}
            currentPlan={currentPlan}
            onSelectPlan={() => handleSelectPlan("ENTERPRISE")}
          />
        </div>

        {/* Feature Comparison Table */}
        <div className="mx-auto mt-24 max-w-6xl">
          <h3 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-white">
            Compare all features
          </h3>
          <FeatureComparison />
        </div>

        {/* FAQ or Additional Info */}
        <div className="mx-auto mt-24 max-w-3xl text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            All plans include
          </h3>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="text-4xl">🔒</div>
              <h4 className="mt-4 font-semibold text-gray-900 dark:text-white">
                Secure & Reliable
              </h4>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Enterprise-grade security and 99.9% uptime
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="text-4xl">⚡</div>
              <h4 className="mt-4 font-semibold text-gray-900 dark:text-white">
                Lightning Fast
              </h4>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Real-time event processing and notifications
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="text-4xl">🔄</div>
              <h4 className="mt-4 font-semibold text-gray-900 dark:text-white">
                Easy Migration
              </h4>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Upgrade or downgrade anytime, no hassle
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="text-4xl">💳</div>
              <h4 className="mt-4 font-semibold text-gray-900 dark:text-white">
                Flexible Billing
              </h4>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Choose your billing date and cancel anytime
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
