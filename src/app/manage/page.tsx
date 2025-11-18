"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import { CategoryForm } from "@/components/CategoryForm"
import { CategoryList } from "@/components/CategoryList"
import { EventForm } from "@/components/EventForm"
import { EventList } from "@/components/EventList"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
  createdAt: string
  events: any[]
}

interface Event {
  id: string
  title: string
  description?: string
  createdAt: string
  categoryId: string
  category: {
    id: string
    name: string
  }
}

export default function ManagePage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<"categories" | "events">("categories")
  const [categories, setCategories] = useState<Category[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/")
    }
  }, [isLoaded, user, router])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [categoriesRes, eventsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/events"),
      ])

      if (categoriesRes.ok) {
        const data = await categoriesRes.json()
        setCategories(data.categories)
      }

      if (eventsRes.ok) {
        const data = await eventsRes.json()
        setEvents(data.events)
      }
    } catch (error) {
      toast.error("Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCategorySuccess = () => {
    setShowCategoryForm(false)
    setEditingCategory(null)
    fetchData()
  }

  const handleEventSuccess = () => {
    setShowEventForm(false)
    setEditingEvent(null)
    fetchData()
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setShowCategoryForm(true)
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setShowEventForm(true)
  }

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-xl">
                DS
              </div>
              <span className="text-white font-semibold text-xl">
                Discord SaaS
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Manage Categories & Events
          </h1>
          <p className="text-gray-400">
            Create and organize your event categories and tracking events
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-white/10">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("categories")}
              className={`pb-3 px-1 font-medium transition-colors relative ${
                activeTab === "categories"
                  ? "text-indigo-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Categories ({categories.length})
              {activeTab === "categories" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("events")}
              className={`pb-3 px-1 font-medium transition-colors relative ${
                activeTab === "events"
                  ? "text-indigo-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Events ({events.length})
              {activeTab === "events" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
              )}
            </button>
          </div>
        </div>

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            {/* Create/Edit Category Form */}
            {showCategoryForm ? (
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  {editingCategory ? "Edit Category" : "Create New Category"}
                </h2>
                <CategoryForm
                  initialData={editingCategory || undefined}
                  mode={editingCategory ? "edit" : "create"}
                  onSuccess={handleCategorySuccess}
                  onCancel={() => {
                    setShowCategoryForm(false)
                    setEditingCategory(null)
                  }}
                />
              </div>
            ) : (
              <button
                onClick={() => setShowCategoryForm(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Create New Category
              </button>
            )}

            {/* Categories List */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Your Categories
              </h2>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <CategoryList
                  categories={categories}
                  onEdit={handleEditCategory}
                  onRefresh={fetchData}
                />
              )}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div className="space-y-6">
            {/* Create/Edit Event Form */}
            {showEventForm ? (
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  {editingEvent ? "Edit Event" : "Create New Event"}
                </h2>
                <EventForm
                  categories={categories}
                  initialData={editingEvent || undefined}
                  mode={editingEvent ? "edit" : "create"}
                  onSuccess={handleEventSuccess}
                  onCancel={() => {
                    setShowEventForm(false)
                    setEditingEvent(null)
                  }}
                />
              </div>
            ) : (
              <button
                onClick={() => setShowEventForm(true)}
                disabled={categories.length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                {categories.length === 0
                  ? "Create a category first"
                  : "Create New Event"}
              </button>
            )}

            {/* Events List */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Your Events
              </h2>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <EventList
                  events={events}
                  onEdit={handleEditEvent}
                  onRefresh={fetchData}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
