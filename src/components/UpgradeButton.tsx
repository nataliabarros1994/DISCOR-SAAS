"use client"

import { useRouter } from "next/navigation"
import { ShinyButton } from "./ShinyButton"

export function UpgradeButton() {
  const router = useRouter()

  const handleUpgrade = () => {
    // Redirect to pricing page where user can select plan and billing options
    router.push("/pricing")
  }

  return (
    <ShinyButton
      onClick={handleUpgrade}
      className="text-lg px-8 py-4"
    >
      Upgrade to Pro
    </ShinyButton>
  )
}
