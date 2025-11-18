"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Copy, Plus, Trash2, ToggleLeft, ToggleRight, RefreshCw } from "lucide-react"

interface UserWebhook {
  id: string
  name: string
  url: string
  secret: string
  events: string[]
  active: boolean
  createdAt: string
  _count?: {
    logs: number
  }
}

const AVAILABLE_EVENTS = [
  "category.created",
  "category.updated",
  "category.deleted",
  "event.created",
  "event.deleted",
  "user.plan.upgraded",
  "user.plan.downgraded",
  "user.plan.canceled",
  "quota.exceeded",
  "payment.succeeded",
  "payment.failed",
]

export default function WebhooksAdminPage() {
  const queryClient = useQueryClient()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    events: [] as string[],
  })

  // Fetch webhooks
  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ["user-webhooks"],
    queryFn: async () => {
      const response = await fetch("/api/webhooks/user")
      if (!response.ok) throw new Error("Failed to fetch webhooks")
      return response.json()
    },
  })

  // Create webhook mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/webhooks/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create webhook")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-webhooks"] })
      toast.success("Webhook created successfully!")
      setShowCreateForm(false)
      setFormData({ name: "", url: "", events: [] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // Delete webhook mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/webhooks/user?id=${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete webhook")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-webhooks"] })
      toast.success("Webhook deleted!")
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // Toggle webhook active status
  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const response = await fetch(`/api/webhooks/user`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active }),
      })
      if (!response.ok) throw new Error("Failed to toggle webhook")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-webhooks"] })
      toast.success("Webhook status updated!")
    },
  })

  const copySecret = (secret: string) => {
    navigator.clipboard.writeText(secret)
    toast.success("Secret copied to clipboard!")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.url || formData.events.length === 0) {
      toast.error("Please fill all fields and select at least one event")
      return
    }
    createMutation.mutate(formData)
  }

  const toggleEvent = (event: string) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }))
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 py-12">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Webhook Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Configure custom webhooks to receive real-time event notifications
          </p>
        </div>

        {/* Create Button */}
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="mb-6 flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5" />
          Create New Webhook
        </button>

        {/* Create Form */}
        {showCreateForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 rounded-2xl border-2 border-indigo-200 bg-white p-6 shadow-lg dark:border-indigo-800 dark:bg-gray-800"
          >
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Create Webhook
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="My Webhook"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="https://example.com/webhook"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Events to Listen
                </label>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {AVAILABLE_EVENTS.map((event) => (
                    <button
                      key={event}
                      type="button"
                      onClick={() => toggleEvent(event)}
                      className={`rounded-lg border-2 px-3 py-2 text-sm transition ${
                        formData.events.includes(event)
                          ? "border-indigo-600 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300"
                          : "border-gray-300 bg-white text-gray-700 hover:border-indigo-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {event}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? "Creating..." : "Create Webhook"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Webhooks List */}
        {webhooks.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              No webhooks configured. Create your first webhook to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {webhooks.map((webhook: UserWebhook) => (
              <div
                key={webhook.id}
                className="rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {webhook.name}
                      </h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          webhook.active
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {webhook.active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <p className="mt-2 font-mono text-sm text-gray-600 dark:text-gray-400">
                      {webhook.url}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Secret:</span>
                      <code className="rounded bg-gray-100 px-2 py-1 text-xs dark:bg-gray-700">
                        {webhook.secret.slice(0, 20)}...
                      </code>
                      <button
                        onClick={() => copySecret(webhook.secret)}
                        className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Events:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {webhook.events.map((event) => (
                          <span
                            key={event}
                            className="rounded bg-indigo-100 px-2 py-1 text-xs text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                          >
                            {event}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        toggleMutation.mutate({ id: webhook.id, active: !webhook.active })
                      }
                      className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                      title={webhook.active ? "Deactivate" : "Activate"}
                    >
                      {webhook.active ? (
                        <ToggleRight className="h-6 w-6" />
                      ) : (
                        <ToggleLeft className="h-6 w-6" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(webhook.id)}
                      className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      title="Delete webhook"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 rounded-2xl border-2 border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
          <h3 className="mb-3 font-semibold text-blue-900 dark:text-blue-300">
            How to Validate Webhooks
          </h3>
          <p className="mb-3 text-sm text-blue-800 dark:text-blue-200">
            All webhook requests include an <code>X-Webhook-Signature</code> header containing an HMAC-SHA256 signature. Validate it using your secret:
          </p>
          <pre className="overflow-auto rounded bg-blue-100 p-4 text-xs dark:bg-blue-950">
{`const crypto = require('crypto')

function validateWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(JSON.stringify(payload))
  const computed = hmac.digest('hex')
  return computed === signature
}`}
          </pre>
        </div>
      </div>
    </div>
  )
}
