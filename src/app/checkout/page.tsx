"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { BillingDateSelector } from "@/components/BillingDateSelector"
import { PricingToggle } from "@/components/PricingToggle"
import { PLANS, type PlanTier } from "@/lib/plans"
import { ArrowLeft, CreditCard, Shield } from "lucide-react"
import Link from "next/link"

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { userId, isSignedIn } = useAuth()

  const [mounted, setMounted] = useState(false)
  const planParam = (searchParams.get("plan") as PlanTier) || "PRO"
  const periodParam = (searchParams.get("period") as "monthly" | "annual") || "monthly"

  const [selectedPlan, setSelectedPlan] = useState<PlanTier>(planParam)
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">(periodParam)
  const [billingDay, setBillingDay] = useState<number>(new Date().getDate())
  const [email, setEmail] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingEmail, setIsLoadingEmail] = useState(true)

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch user email
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const response = await fetch("/api/user/email")
        if (response.ok) {
          const data = await response.json()
          setEmail(data.email || "")
        }
      } catch (error) {
        console.error("Error fetching user email:", error)
      } finally {
        setIsLoadingEmail(false)
      }
    }

    if (isSignedIn) {
      fetchUserEmail()
    }
  }, [isSignedIn])

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/sign-in?redirect_url=/pricing")
    }
  }, [isSignedIn, router])

  const plan = PLANS[selectedPlan]
  const price = billingPeriod === "monthly" ? plan.monthlyPrice : plan.annualPrice / 12
  const totalPrice = billingPeriod === "monthly" ? plan.monthlyPrice : plan.annualPrice

  const handleCheckout = async () => {
    setIsLoading(true)

    try {
      // Get the appropriate price ID
      const priceId =
        selectedPlan === "PRO"
          ? billingPeriod === "monthly"
            ? process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID
            : process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID
          : billingPeriod === "monthly"
            ? process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID
            : process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          plan: selectedPlan,
          billingPeriod,
          billingDay,
          email,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || "Failed to create checkout session")
      }
    } catch (error) {
      console.error("Checkout error:", error)
      alert("Failed to start checkout. Please try again.")
      setIsLoading(false)
    }
  }

  // Show loading spinner until component is mounted on client
  if (!mounted || !isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {!mounted ? "Loading..." : "Redirecting to sign in..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Back Button */}
        <Link
          href="/pricing"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to pricing
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Plan Summary */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Complete Your Subscription
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              You're one step away from unlocking premium features
            </p>

            {/* Plan Card */}
            <div className="mt-8 rounded-2xl border-2 border-indigo-200 bg-white p-6 dark:border-indigo-800 dark:bg-gray-800">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {plan.name} Plan
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Billed {billingPeriod}
                  </p>
                </div>
                <button
                  onClick={() => router.push("/pricing")}
                  className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  Change
                </button>
              </div>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  ${price.toFixed(2)}
                </span>
                <span className="text-gray-500">/month</span>
              </div>

              {billingPeriod === "annual" && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-green-600 dark:text-green-400">
                    Save 20% with annual billing
                  </span>
                  <span className="text-sm text-gray-500">
                    (${totalPrice.toFixed(2)}/year)
                  </span>
                </div>
              )}

              {/* Billing Period Toggle */}
              <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                <PricingToggle period={billingPeriod} onChange={setBillingPeriod} />
              </div>

              {/* Key Features */}
              <div className="mt-6 space-y-3 border-t border-gray-200 pt-6 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  What's included:
                </h4>
                {plan.features.slice(0, 5).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 flex items-start gap-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
              <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-semibold">Secure payment powered by Stripe</p>
                <p className="mt-1 text-blue-600 dark:text-blue-400">
                  Your payment information is encrypted and secure. We never store
                  your card details.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Billing Configuration */}
          <div>
            {/* Email Field */}
            <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Email de Confirmação
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Enviaremos a confirmação da sua assinatura para este email
              </p>
              <div className="mt-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoadingEmail}
                  placeholder="seu@email.com"
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                  required
                />
              </div>
            </div>

            {/* Billing Date Selector */}
            <div className="mt-6">
              <BillingDateSelector
                selectedDay={billingDay}
                onChange={setBillingDay}
                monthlyPrice={price}
              />
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={isLoading || !email || isLoadingEmail}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 font-semibold text-white shadow-lg transition-all hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Subscribe to {plan.name} Plan
                </>
              )}
            </button>

            {/* Terms */}
            <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
              By subscribing, you agree to our Terms of Service and Privacy Policy.
              You can cancel anytime.
            </p>

            {/* FAQ */}
            <div className="mt-8 space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Frequently Asked Questions
              </h4>
              <details className="rounded-lg bg-white p-4 dark:bg-gray-800">
                <summary className="cursor-pointer font-medium text-gray-900 dark:text-white">
                  Can I cancel anytime?
                </summary>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Yes! You can cancel your subscription anytime from your account
                  settings. You'll keep access until the end of your billing period.
                </p>
              </details>
              <details className="rounded-lg bg-white p-4 dark:bg-gray-800">
                <summary className="cursor-pointer font-medium text-gray-900 dark:text-white">
                  Can I change my billing date later?
                </summary>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Absolutely! You can update your preferred billing date anytime from
                  your account settings.
                </p>
              </details>
              <details className="rounded-lg bg-white p-4 dark:bg-gray-800">
                <summary className="cursor-pointer font-medium text-gray-900 dark:text-white">
                  What payment methods do you accept?
                </summary>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  We accept all major credit and debit cards via Stripe, including
                  Visa, Mastercard, American Express, and more.
                </p>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}