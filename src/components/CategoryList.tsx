"use client"

import { useState } from "react"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
  createdAt: string
  events: any[]
}

interface CategoryListProps {
  categories: Category[]
  onEdit: (category: Category) => void
  onRefresh: () => void
}

export function CategoryList({
  categories,
  onEdit,
  onRefresh,
}: CategoryListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  )

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)

      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete category")
      }

      toast.success("Category deleted successfully!")
      setShowDeleteConfirm(null)
      onRefresh()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete category"
      toast.error(message)
    } finally {
      setDeletingId(null)
    }
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
        <svg
          className="w-16 h-16 text-gray-600 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
        <h3 className="text-gray-400 text-lg font-medium mb-2">
          No categories yet
        </h3>
        <p className="text-gray-500 text-sm">
          Create your first category to start organizing events
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {categories.map((category) => (
        <div
          key={category.id}
          className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
        >
          <div className="flex-1">
            <h3 className="text-white font-medium mb-1">{category.name}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                {category.events.length} event
                {category.events.length !== 1 ? "s" : ""}
              </span>
              <span>
                Created {new Date(category.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(category)}
              className="p-2 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-colors"
              title="Edit category"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>

            <button
              onClick={() => setShowDeleteConfirm(category.id)}
              disabled={deletingId === category.id}
              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete category"
            >
              {deletingId === category.id ? (
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm === category.id && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 border border-white/10 rounded-xl p-6 max-w-md w-full">
                <h3 className="text-xl font-bold text-white mb-2">
                  Delete Category?
                </h3>
                <p className="text-gray-300 mb-2">
                  Are you sure you want to delete "<strong>{category.name}</strong>"?
                </p>
                {category.events.length > 0 && (
                  <p className="text-red-400 text-sm mb-4">
                    Warning: This will also delete {category.events.length}{" "}
                    associated event{category.events.length !== 1 ? "s" : ""}.
                  </p>
                )}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => handleDelete(category.id)}
                    disabled={deletingId === category.id}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    {deletingId === category.id ? "Deleting..." : "Delete"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    disabled={deletingId === category.id}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-2 px-4 rounded-lg transition-colors border border-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
