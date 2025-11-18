"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { eventSchema, type EventInput } from "@/lib/validations"
import { toast } from "sonner"
import { useState } from "react"

interface Category {
  id: string
  name: string
}

interface EventFormProps {
  categories: Category[]
  onSuccess?: () => void
  onCancel?: () => void
  initialData?: {
    id: string
    title: string
    description?: string
    categoryId: string
  }
  mode?: "create" | "edit"
}

export function EventForm({
  categories,
  onSuccess,
  onCancel,
  initialData,
  mode = "create",
}: EventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EventInput>({
    resolver: zodResolver(eventSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      categoryId: categories[0]?.id || "",
      scheduledFor: "",
    },
  })

  const onSubmit = async (data: EventInput) => {
    try {
      setIsSubmitting(true)

      const url =
        mode === "create" ? "/api/events" : `/api/events/${initialData?.id}`

      const method = mode === "create" ? "POST" : "PATCH"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save event")
      }

      toast.success(
        mode === "create"
          ? "Event created successfully!"
          : "Event updated successfully!"
      )

      reset()
      onSuccess?.()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save event"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 px-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
        <svg
          className="w-12 h-12 text-orange-400 mx-auto mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="text-orange-300 font-medium mb-1">
          No Categories Available
        </h3>
        <p className="text-orange-200/70 text-sm">
          Please create a category first before adding events
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Event Title
        </label>
        <input
          {...register("title")}
          type="text"
          id="title"
          placeholder="e.g., User signed up, Payment received"
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Description (Optional)
        </label>
        <textarea
          {...register("description")}
          id="description"
          rows={3}
          placeholder="Add more details about this event..."
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-400">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="categoryId"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Category
        </label>
        <select
          {...register("categoryId")}
          id="categoryId"
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id} className="bg-slate-800">
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1 text-sm text-red-400">
            {errors.categoryId.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="eventDate"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            📅 Data do Evento (Opcional)
          </label>
          <input
            type="date"
            id="eventDate"
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            onChange={(e) => {
              const dateValue = e.target.value
              const timeValue = (document.getElementById("eventTime") as HTMLSelectElement)?.value || ""
              if (dateValue && timeValue) {
                const datetime = `${dateValue}T${timeValue}`
                setValue("scheduledFor", datetime)
              } else if (dateValue) {
                // If only date, set to midnight
                setValue("scheduledFor", `${dateValue}T00:00`)
              } else {
                setValue("scheduledFor", "")
              }
            }}
          />
          <p className="mt-1 text-xs text-gray-400">
            Escolha qualquer dia
          </p>
        </div>

        <div>
          <label
            htmlFor="eventTime"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            🕐 Hora do Evento (Opcional)
          </label>
          <select
            id="eventTime"
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            onChange={(e) => {
              const timeValue = e.target.value
              const dateValue = (document.getElementById("eventDate") as HTMLInputElement)?.value
              if (dateValue && timeValue) {
                const datetime = `${dateValue}T${timeValue}`
                setValue("scheduledFor", datetime)
              }
            }}
          >
            <option value="">Selecione a hora</option>
            {Array.from({ length: 24 }, (_, i) => {
              const hour = i.toString().padStart(2, '0')
              return (
                <option key={hour} value={`${hour}:00`} className="bg-slate-800">
                  {hour}:00
                </option>
              )
            })}
          </select>
          <p className="mt-1 text-xs text-gray-400">
            00:00 até 23:00
          </p>
        </div>
      </div>

      {/* Hidden input that actually holds the datetime value */}
      <input
        {...register("scheduledFor")}
        type="hidden"
        id="scheduledFor"
      />

      {errors.scheduledFor && (
        <p className="mt-1 text-sm text-red-400">
          {errors.scheduledFor.message}
        </p>
      )}
      <p className="text-xs text-gray-400">
        💡 Quando você será notificado no Discord sobre este evento
      </p>

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
            "Create Event"
          ) : (
            "Update Event"
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:bg-white/5 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors border border-white/10"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
