import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function CancelPage() {
  const user = await currentUser()

  if (!user) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
        {/* Cancel Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-orange-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Cancel Message */}
        <h1 className="text-3xl font-bold text-white mb-4">
          Payment Cancelled
        </h1>
        <p className="text-gray-300 mb-8">
          Your payment was cancelled. No charges have been made to your account.
        </p>

        {/* Info Box */}
        <div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-lg text-left">
          <p className="text-sm text-gray-400 mb-3">
            You're still on the <span className="text-white font-semibold">FREE</span> plan.
          </p>
          <p className="text-sm text-gray-400">
            Upgrade anytime to unlock premium features like unlimited events, advanced analytics, and priority support.
          </p>
        </div>

        {/* What You're Missing */}
        <div className="mb-8 text-left">
          <p className="text-sm text-gray-500 mb-3">With Pro, you get:</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm text-gray-400">Unlimited events & categories</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm text-gray-400">Advanced analytics dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-sm text-gray-400">Priority customer support</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Try Again - Upgrade to Pro
          </Link>
          <Link
            href="/dashboard"
            className="block w-full bg-white/5 hover:bg-white/10 text-white font-semibold py-3 px-6 rounded-lg transition-colors border border-white/10"
          >
            Continue with Free Plan
          </Link>
        </div>

        {/* Help Text */}
        <p className="text-xs text-gray-500 mt-6">
          Need help? Contact us at support@discordsaas.com
        </p>
      </div>
    </div>
  )
}
