"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { categorySchema, type CategoryInput } from "@/lib/validations"
import { toast } from "sonner"
import { useState } from "react"

interface CategoryFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  initialData?: { id: string; name: string }
  mode?: "create" | "edit"
}

export function CategoryForm({
  onSuccess,
  onCancel,
  initialData,
  mode = "create",
}: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData || { name: "" },
  })

  const onSubmit = async (data: CategoryInput) => {
    try {
      setIsSubmitting(true)

      const url =
        mode === "create"
          ? "/api/categories"
          : `/api/categories/${initialData?.id}`

      const method = mode === "create" ? "POST" : "PATCH"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save category")
      }

      toast.success(
        mode === "create"
          ? "Category created successfully!"
          : "Category updated successfully!"
      )

      reset()
      onSuccess?.()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save category"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Category Name
        </label>
        <input
          {...register("name")}
          type="text"
          id="name"
          placeholder="e.g., Sales, Support, Marketing"
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-gray-400"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
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
              Saving...
            </>
          ) : mode === "create" ? (
            "Create Category"
          ) : (
            "Update Category"
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 font-semibold rounded-lg transition-colors border border-gray-300 dark:bg-white/5 dark:hover:bg-white/10 dark:disabled:bg-white/5 dark:text-white dark:border-white/10"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
