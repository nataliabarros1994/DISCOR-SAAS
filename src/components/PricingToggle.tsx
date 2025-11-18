"use client"

interface PricingToggleProps {
  period: "monthly" | "annual"
  onChange: (period: "monthly" | "annual") => void
}

export function PricingToggle({ period, onChange }: PricingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <span
        className={`text-lg font-medium transition-colors ${
          period === "monthly"
            ? "text-gray-900 dark:text-white"
            : "text-gray-400 dark:text-gray-500"
        }`}
      >
        Monthly
      </span>

      <button
        onClick={() => onChange(period === "monthly" ? "annual" : "monthly")}
        className="relative h-8 w-16 rounded-full bg-gray-200 transition-colors dark:bg-gray-700"
        aria-label="Toggle billing period"
      >
        <div
          className={`absolute top-1 h-6 w-6 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md transition-transform ${
            period === "annual" ? "translate-x-9" : "translate-x-1"
          }`}
        />
      </button>

      <span
        className={`text-lg font-medium transition-colors ${
          period === "annual"
            ? "text-gray-900 dark:text-white"
            : "text-gray-400 dark:text-gray-500"
        }`}
      >
        Annual
        <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700 dark:bg-green-900 dark:text-green-300">
          Save 20%
        </span>
      </span>
    </div>
  )
}
