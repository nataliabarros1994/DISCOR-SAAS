/**
 * Next.js Instrumentation Hook
 * Runs once when the server starts
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Only run on server
    const { initializeServer } = await import("./src/lib/server-init")
    initializeServer()
  }
}
