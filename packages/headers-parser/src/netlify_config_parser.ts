import fs from 'fs/promises'

import { parse as loadToml } from '@iarna/toml'

import { splitResults } from './results.js'
import type { MinimalHeader } from './types.js'

// Parse `headers` field in "netlify.toml" to an array of objects.
// This field is already an array of objects, so it only validates and
// normalizes it.
export const parseConfigHeaders = async function (netlifyConfigPath: string) {
  try {
    await fs.access(netlifyConfigPath)
  } catch {
    return splitResults([])
  }

  const headers = await parseConfig(netlifyConfigPath)
  return splitResults(headers)
}

// Load the configuration file and parse it (TOML)
const parseConfig = async function (configPath: string) {
  try {
    const configString = await fs.readFile(configPath, 'utf8')
    const config = loadToml(configString)
    // Convert `null` prototype objects to normal plain objects
    const { headers = [] } = JSON.parse(JSON.stringify(config))
    if (!Array.isArray(headers)) {
      throw new TypeError(`"headers" must be an array`)
    }
    // TODO(serhalp) Validate shape instead of assuming and asserting type
    return headers as MinimalHeader[]
  } catch (error) {
    return [new Error(`Could not parse configuration file: ${error}`)]
  }
}
