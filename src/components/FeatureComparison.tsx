"use client"

import { Check, X } from "lucide-react"
import { PLANS, type PlanTier } from "@/lib/plans"

const comparisonFeatures = [
  { name: "Discord Notifications", free: true, pro: true, enterprise: true },
  { name: "Email Support", free: true, pro: true, enterprise: true },
  { name: "Events per Month", free: "100", pro: "Unlimited", enterprise: "Unlimited" },
  { name: "Event Categories", free: "3", pro: "Unlimited", enterprise: "Unlimited" },
  { name: "Data Retention", free: "7 days", pro: "90 days", enterprise: "Unlimited" },
  { name: "API Access", free: false, pro: true, enterprise: true },
  { name: "API Calls per Month", free: "-", pro: "10,000", enterprise: "Unlimited" },
  { name: "Team Members", free: "1", pro: "5", enterprise: "Unlimited" },
  { name: "Custom Webhooks", free: false, pro: "5", enterprise: "Unlimited" },
  { name: "Advanced Analytics", free: false, pro: true, enterprise: true },
  { name: "Priority Support", free: false, pro: "12h", enterprise: "1h" },
  { name: "24/7 Support", free: false, pro: false, enterprise: true },
  { name: "Dedicated Account Manager", free: false, pro: false, enterprise: true },
  { name: "SLA Guarantee", free: false, pro: false, enterprise: "99.9%" },
  { name: "Custom Integrations", free: false, pro: false, enterprise: true },
  { name: "White-label Options", free: false, pro: false, enterprise: true },
  { name: "On-premise Deployment", free: false, pro: false, enterprise: true },
  { name: "SSO & 2FA", free: false, pro: false, enterprise: true },
]

export function FeatureComparison() {
  return (
    <div className="mt-16 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Features
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                {PLANS.FREE.name}
              </th>
              <th className="bg-indigo-50 px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:bg-indigo-950/20 dark:text-white">
                {PLANS.PRO.name}
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                {PLANS.ENTERPRISE.name}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {comparisonFeatures.map((feature, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  {feature.name}
                </td>
                <td className="px-6 py-4 text-center">
                  {renderFeatureCell(feature.free)}
                </td>
                <td className="bg-indigo-50/50 px-6 py-4 text-center dark:bg-indigo-950/10">
                  {renderFeatureCell(feature.pro)}
                </td>
                <td className="px-6 py-4 text-center">
                  {renderFeatureCell(feature.enterprise)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function renderFeatureCell(value: string | boolean) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="mx-auto h-5 w-5 text-green-500" />
    ) : (
      <X className="mx-auto h-5 w-5 text-gray-300 dark:text-gray-600" />
    )
  }
  return (
    <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>
  )
}
