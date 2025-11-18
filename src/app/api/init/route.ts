import { NextResponse } from "next/server"
import { initializeApp } from "@/lib/initialize"

/**
 * GET /api/init
 * Initialize all application services
 * This endpoint is called once when the app starts
 */
export async function GET() {
  try {
    await initializeApp()
    return NextResponse.json({ success: true, message: "Application initialized successfully" })
  } catch (error) {
    console.error("Failed to initialize app:", error)
    return NextResponse.json(
      { success: false, error: "Failed to initialize application" },
      { status: 500 }
    )
  }
}
