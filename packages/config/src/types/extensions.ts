import * as z from 'zod'

export const ExtensionSchema = z.object({
  author: z.string().optional(),
  has_build: z.boolean().optional(),
  slug: z.string(),
  version: z.string().optional(),
  dev: z.object({ path: z.string() }).optional(),
})

export type Extension = z.output<typeof ExtensionSchema>
