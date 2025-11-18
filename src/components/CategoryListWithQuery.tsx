"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Trash2, Calendar, Hash } from "lucide-react"
import { useState } from "react"

interface Category {
  id: string
  name: string
  slug: string
  createdAt: string
  updatedAt: string
  metadata: any
  _count?: { events: number }
}

export function CategoryListWithQuery() {
  const queryClient = useQueryClient()
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories")
      if (!response.ok) throw new Error("Failed to fetch categories")
      return response.json()
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  })

  const deleteMutation = useMutation({
    mutationFn: async (slug: string) => {
      const response = await fetch(`/api/categories?slug=${slug}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast.success(`Category deleted! ${data.deletedEvents} events removed.`)
      setDeletingSlug(null)
    },
    onError: (error: Error) => {
      toast.error(error.message)
      setDeletingSlug(null)
    },
  })

  const handleDelete = (slug: string, name: string) => {
    if (confirm(`Delete "${name}" category? This will also delete all associated events.`)) {
      setDeletingSlug(slug)
      deleteMutation.mutate(slug)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
        Error loading categories: {(error as Error).message}
      </div>
    )
  }

  const categories: Category[] = data?.categories || []

  if (categories.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          No categories yet. Create your first category above!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Total: <strong>{categories.length}</strong> categories
      </p>

      {categories.map((category) => (
        <div
          key={category.id}
          className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-600"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {category.name}
                </h3>
                {category._count && (
                  <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                    {category._count.events} events
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Hash className="h-4 w-4" />
                  <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-700">
                    {category.slug}
                  </code>
                </div>

                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span suppressHydrationWarning>
                    {new Date(category.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {category.metadata && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                    View metadata
                  </summary>
                  <pre className="mt-2 overflow-auto rounded bg-gray-50 p-2 text-xs dark:bg-gray-900">
                    {JSON.stringify(category.metadata, null, 2)}
                  </pre>
                </details>
              )}
            </div>

            <button
              onClick={() => handleDelete(category.slug, category.name)}
              disabled={deletingSlug === category.slug}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              title="Delete category"
            >
              {deletingSlug === category.slug ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
              ) : (
                <Trash2 className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
