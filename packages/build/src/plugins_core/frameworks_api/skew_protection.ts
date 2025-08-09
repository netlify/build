import { promises as fs } from 'node:fs'

import { z } from 'zod'

const deployIDSourceTypeSchema = z.enum(['cookie', 'header', 'query'])

const deployIDSourceSchema = z.object({
  type: deployIDSourceTypeSchema,
  name: z.string(),
})

const skewProtectionConfigSchema = z.object({
  patterns: z.array(z.string()),
  sources: z.array(deployIDSourceSchema),
})

export type SkewProtectionConfig = z.infer<typeof skewProtectionConfigSchema>
export type DeployIDSource = z.infer<typeof deployIDSourceSchema>
export type DeployIDSourceType = z.infer<typeof deployIDSourceTypeSchema>

const validateSkewProtectionConfig = (data: unknown): SkewProtectionConfig => {
  try {
    return skewProtectionConfigSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid skew protection configuration: ${error.message}`)
    }

    throw error
  }
}

export const loadSkewProtectionConfig = async (configPath: string) => {
  try {
    const data = await fs.readFile(configPath, 'utf8')
    const config = validateSkewProtectionConfig(JSON.parse(data))

    return config
  } catch (err) {
    // If the file doesn't exist, this is a non-error.
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw err
    }
  }
}
