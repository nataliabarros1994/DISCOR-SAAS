import { z } from "zod"

// Event validation schema
export const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  categoryId: z.string().cuid("Invalid category ID"),
  scheduledFor: z.string().nullish().transform((val) => {
    // If null, undefined, or empty string, return undefined
    if (!val || val === "") return undefined
    // datetime-local format: "2025-11-15T14:30"
    // Convert to ISO 8601: "2025-11-15T14:30:00.000Z"
    return new Date(val).toISOString()
  }),
})

export type EventInput = z.infer<typeof eventSchema>

// Category validation schema - CREATE
export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  metadata: z.record(z.string(), z.any()).optional(), // Optional JSON metadata
})

export type CategoryInput = z.infer<typeof categorySchema>

// Category validation schema - UPDATE
export const updateCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters").optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>

// Quota validation schema
export const quotaSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  limit: z.number().int().positive("Limit must be a positive number"),
})

export type QuotaInput = z.infer<typeof quotaSchema>

// Update quota schema
export const updateQuotaSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  limit: z.number().int().positive().optional(),
  used: z.number().int().min(0).optional(),
})

export type UpdateQuotaInput = z.infer<typeof updateQuotaSchema>

// Discord notification schema
export const discordNotificationSchema = z.object({
  message: z.string().min(1, "Message is required").max(2000, "Message must be less than 2000 characters"),
})

export type DiscordNotificationInput = z.infer<typeof discordNotificationSchema>

// Embed notification schema
export const embedNotificationSchema = z.object({
  title: z.string().min(1, "Title is required").max(256, "Title must be less than 256 characters"),
  description: z.string().min(1, "Description is required").max(4096, "Description must be less than 4096 characters"),
  color: z.number().int().min(0).max(0xffffff).optional(),
  fields: z.array(
    z.object({
      name: z.string().min(1).max(256),
      value: z.string().min(1).max(1024),
      inline: z.boolean().optional(),
    })
  ).max(25, "Maximum 25 fields allowed").optional(),
})

export type EmbedNotificationInput = z.infer<typeof embedNotificationSchema>
