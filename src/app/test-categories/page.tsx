"use client"

import { CategoryForm } from "@/components/CategoryForm"
import { CategoryListWithQuery } from "@/components/CategoryListWithQuery"
import { useState } from "react"

export default function TestCategoriesPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 py-12">
      <div className="mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            🧪 Test Category System
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create categories and watch Discord notifications in real-time
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Form Section */}
          <div className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Create New Category
            </h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Fill in the form below. A Discord notification will be sent automatically!
            </p>
            <CategoryForm
              onSuccess={() => {
                setRefreshKey((prev) => prev + 1)
              }}
            />
          </div>

          {/* Instructions Section */}
          <div className="space-y-6">
            <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-800 dark:bg-indigo-900/20">
              <h3 className="mb-3 font-semibold text-indigo-900 dark:text-indigo-300">
                📋 Testing Instructions
              </h3>
              <ol className="space-y-2 text-sm text-indigo-800 dark:text-indigo-200">
                <li className="flex gap-2">
                  <span className="font-bold">1.</span>
                  <span>Fill in the category name (required)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">2.</span>
                  <span>
                    Optionally add metadata in JSON format, e.g.:{" "}
                    <code className="rounded bg-indigo-200 px-1 dark:bg-indigo-800">
                      {"{"}"color": "blue"{"}"}
                    </code>
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">3.</span>
                  <span>Click "Create Category"</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">4.</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    Check your Discord channel for the notification! 🎉
                  </span>
                </li>
              </ol>
            </div>

            <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
              <h3 className="mb-3 font-semibold text-green-900 dark:text-green-300">
                ✅ Expected Discord Notification
              </h3>
              <ul className="space-y-1 text-sm text-green-800 dark:text-green-200">
                <li>• Title: "📁 Category Created 🎉"</li>
                <li>• Purple color embed</li>
                <li>• Fields: Name, ID, Slug, User ID, Created At</li>
                <li>• Metadata (if provided)</li>
                <li>• Timestamp</li>
              </ul>
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="mt-8 rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Your Categories
          </h2>
          <CategoryListWithQuery key={refreshKey} />
        </div>

        {/* API Info */}
        <div className="mt-8 rounded-2xl border-2 border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
          <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
            🔧 API Endpoints
          </h3>
          <div className="space-y-2 text-sm font-mono">
            <div>
              <span className="text-green-600 dark:text-green-400">POST</span>{" "}
              <span className="text-gray-700 dark:text-gray-300">
                /api/categories
              </span>
              {" → Create category"}
            </div>
            <div>
              <span className="text-blue-600 dark:text-blue-400">GET</span>{" "}
              <span className="text-gray-700 dark:text-gray-300">
                /api/categories
              </span>
              {" → List categories"}
            </div>
            <div>
              <span className="text-yellow-600 dark:text-yellow-400">PUT</span>{" "}
              <span className="text-gray-700 dark:text-gray-300">
                /api/categories
              </span>
              {" → Update category"}
            </div>
            <div>
              <span className="text-red-600 dark:text-red-400">DELETE</span>{" "}
              <span className="text-gray-700 dark:text-gray-300">
                /api/categories?slug=xxx
              </span>
              {" → Delete category"}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
