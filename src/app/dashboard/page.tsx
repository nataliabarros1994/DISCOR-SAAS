import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import { UpgradeButton } from "@/components/UpgradeButton"

export default async function DashboardPage() {
  const user = await currentUser()

  if (!user) {
    redirect("/")
  }

  // Get or create user in database
  let dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    include: {
      categories: {
        include: {
          events: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      },
      quotas: true,
      events: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  })

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        plan: "FREE",
      },
      include: {
        categories: {
          include: {
            events: {
              orderBy: { createdAt: "desc" },
              take: 5,
            },
          },
        },
        quotas: true,
        events: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-xl">
                DS
              </div>
              <span className="text-white font-semibold text-xl">Discord SaaS</span>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/manage"
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                Manage
              </Link>
              <Link
                href="/pricing"
                className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                Pricing
              </Link>
              <Link
                href="/pricing"
                className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
              >
                <span className="text-sm text-gray-400">Plan:</span>
                <span className={`text-sm font-semibold ${dbUser.plan === "PRO" || dbUser.plan === "ENTERPRISE" ? "text-indigo-400" : "text-gray-300"}`}>
                  {dbUser.plan}
                </span>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user.firstName || user.emailAddresses[0]?.emailAddress}!
          </h1>
          <p className="text-gray-400">
            Manage your events, categories, and Discord notifications from here.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm font-medium">Total Events</h3>
              <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-white">{dbUser.events.length}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm font-medium">Categories</h3>
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-white">{dbUser.categories.length}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 text-sm font-medium">Active Quotas</h3>
              <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-4xl font-bold text-white">{dbUser.quotas.length}</p>
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Events</h2>
            <Link href="/manage?tab=events" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
              View All →
            </Link>
          </div>

          {dbUser.events.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-gray-400 text-lg font-medium mb-2">No events yet</h3>
              <p className="text-gray-500 text-sm mb-4">
                Create your first category and start tracking events
              </p>
              <Link
                href="/manage"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Get Started
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {dbUser.events.map((event: any) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors"
                >
                  <div>
                    <h3 className="text-white font-medium">{event.title}</h3>
                    {event.description && (
                      <p className="text-gray-400 text-sm mt-1">{event.description}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(event.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upgrade CTA (for FREE plan users) */}
        {dbUser.plan === "FREE" && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Upgrade to Pro</h2>
            <p className="text-indigo-100 mb-6">
              Get unlimited events, advanced analytics, and priority support
            </p>
            <UpgradeButton />
          </div>
        )}
      </main>
    </div>
  )
}
