"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

interface SessionData {
  id: string
  status: string
  paymentStatus: string
  amountTotal: number
  currency: string
  customerEmail: string
}

export function SuccessPageClient({ userPlan }: { userPlan: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [isVerifying, setIsVerifying] = useState(true)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(10)

  // Handle mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const sessionId = searchParams.get("session_id")

    if (sessionId) {
      // Verify the session
      fetch(`/api/verify-session?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setVerificationError(data.error)
          } else {
            setSessionData(data.session)
          }
        })
        .catch((error) => {
          console.error("Session verification failed:", error)
          setVerificationError("Failed to verify payment session")
        })
        .finally(() => {
          setIsVerifying(false)
        })
    } else {
      setIsVerifying(false)
      setVerificationError("No session ID provided")
    }
  }, [searchParams])

  // Auto-redirect countdown
  useEffect(() => {
    if (!isVerifying && !verificationError && mounted && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)

      return () => clearTimeout(timer)
    }

    if (countdown === 0 && mounted) {
      router.push("/manage")
    }
  }, [countdown, isVerifying, verificationError, router, mounted])

  // Prevent hydration mismatch by showing loading state until mounted
  if (!mounted) {
    return (
      <div className="flex items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-300">Loading...</p>
      </div>
    )
  }

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-300">Verifying payment...</p>
      </div>
    )
  }

  if (verificationError) {
    return (
      <div className="text-center">
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-300 text-sm">{verificationError}</p>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          Don't worry! Your payment was likely successful. Check your email for confirmation.
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
          <svg
            className="w-12 h-12 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      {/* Success Message */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-300">
          Thank you for upgrading to Pro plan
        </p>
      </div>

      {/* Plan Status */}
      <div className="p-4 bg-indigo-600/20 border border-indigo-500/30 rounded-lg">
        <p className="text-sm text-gray-400 mb-1">Current Plan</p>
        <p className="text-2xl font-bold text-indigo-400">{userPlan}</p>
      </div>

      {/* Payment Details */}
      {sessionData && (
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-left space-y-2">
          <h3 className="text-white font-semibold mb-3">Payment Details</h3>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Status:</span>
            <span className="text-green-400 font-medium">
              {sessionData.paymentStatus === "paid" ? "Paid" : sessionData.paymentStatus}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Amount:</span>
            <span className="text-white font-medium">
              ${(sessionData.amountTotal / 100).toFixed(2)} {sessionData.currency.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Email:</span>
            <span className="text-white font-medium">{sessionData.customerEmail}</span>
          </div>
        </div>
      )}

      <p className="text-gray-400 text-sm">
        A confirmation notification has been sent to Discord. You now have access to all Pro features!
      </p>

      {/* Features List */}
      <div className="text-left space-y-3">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="text-white font-medium">Unlimited Events</p>
            <p className="text-gray-400 text-sm">Create as many events as you need</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="text-white font-medium">Advanced Analytics</p>
            <p className="text-gray-400 text-sm">Track and analyze your data</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="text-white font-medium">Priority Support</p>
            <p className="text-gray-400 text-sm">Get help when you need it</p>
          </div>
        </div>
      </div>

      {/* Auto-redirect notice */}
      {countdown > 0 && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-300 text-sm">
            Redirecting to your dashboard in {countdown} second{countdown !== 1 ? "s" : ""}...
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <Link
          href="/manage"
          className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/"
          className="block w-full bg-white/5 hover:bg-white/10 text-white font-semibold py-3 px-6 rounded-lg transition-colors border border-white/10"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
