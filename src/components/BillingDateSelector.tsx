"use client"

import { Calendar } from "lucide-react"

interface BillingDateSelectorProps {
  selectedDay: number
  onChange: (day: number) => void
  monthlyPrice: number
}

export function BillingDateSelector({
  selectedDay,
  onChange,
  monthlyPrice,
}: BillingDateSelectorProps) {
  const today = new Date()
  const currentDay = today.getDate()

  // Calculate first charge preview
  const getFirstChargePreview = () => {
    if (selectedDay > currentDay) {
      // Billing day is later this month
      const daysUntilBilling = selectedDay - currentDay
      return {
        daysUntil: daysUntilBilling,
        date: new Date(today.getFullYear(), today.getMonth(), selectedDay),
        isProrated: true,
      }
    } else {
      // Billing day is next month
      const daysUntilBilling = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        selectedDay
      ).getDate() - currentDay + (new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - currentDay)

      return {
        daysUntil: daysUntilBilling,
        date: new Date(today.getFullYear(), today.getMonth() + 1, selectedDay),
        isProrated: true,
      }
    }
  }

  const preview = getFirstChargePreview()

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Choose Your Billing Date
        </h3>
      </div>

      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Select the day of each month when you want to be charged (1-28)
      </p>

      {/* Day Selector Grid */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
          <button
            key={day}
            onClick={() => onChange(day)}
            className={`rounded-lg p-3 text-sm font-medium transition-all ${
              selectedDay === day
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Billing Preview */}
      <div className="rounded-lg bg-indigo-50 p-4 dark:bg-indigo-950/20">
        <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
          Billing Preview
        </h4>
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex justify-between">
            <span>First charge:</span>
            <span className="font-semibold">Today - ${monthlyPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Next charge:</span>
            <span className="font-semibold">
              {preview.date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Recurring:</span>
            <span className="font-semibold">
              Day {selectedDay} of each month - ${monthlyPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Info Notice */}
      <div className="mt-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          💡 You can change your billing date anytime from your account settings.
          Your first charge includes access until your selected billing date.
        </p>
      </div>
    </div>
  )
}
