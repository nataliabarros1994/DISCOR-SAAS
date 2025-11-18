import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { SuccessPageClient } from "@/components/SuccessPageClient"

export default async function SuccessPage() {
  const user = await currentUser()

  if (!user) {
    redirect("/")
  }

  // Get user from database to show updated plan
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  })

  const userPlan = dbUser?.plan || "FREE"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center">
        <SuccessPageClient userPlan={userPlan} />
      </div>
    </div>
  )
}
