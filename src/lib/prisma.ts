import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  }).$extends({
    query: {
      async $allOperations({ operation, model, args, query }) {
        const maxRetries = 5
        const baseRetryDelay = 3000 // 3 seconds base delay

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            return await query(args)
          } catch (error: any) {
            // Check if it's a connection error (P1001) indicating database is suspended
            const isConnectionError =
              error?.code === "P1001" ||
              error?.message?.includes("Can't reach database server")

            if (isConnectionError && attempt < maxRetries) {
              console.log(
                `🔄 Database waking up, retrying (${attempt}/${maxRetries})...`
              )
              // Exponential backoff: 3s, 6s, 9s, 12s
              const delay = baseRetryDelay * attempt
              console.log(`   Waiting ${delay / 1000}s before next attempt...`)
              await new Promise((resolve) => setTimeout(resolve, delay))
              continue
            }

            // If it's not a connection error or we've exhausted retries, throw the error
            throw error
          }
        }

        // This should never be reached, but TypeScript needs it
        throw new Error("Max retries exceeded")
      },
    },
  })
}

// Create PrismaClient with retry logic for Neon auto-suspend
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
