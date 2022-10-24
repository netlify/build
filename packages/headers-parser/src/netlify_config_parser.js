import { promises as fs } from 'fs'

import { pathExists } from 'path-exists'
import { parse as loadToml } from 'toml'

import { splitResults } from './results.js'

// Parse `headers` field in "netlify.toml" to an array of objects.
// This field is already an array of objects so it only validates and
// normalizes it.
export const parseConfigHeaders = async function (netlifyConfigPath) {
  if (!(await pathExists(netlifyConfigPath))) {
    return splitResults([])
  }

  const headers = await parseConfig(netlifyConfigPath)
  return splitResults(headers)
}

// Load the configuration file and parse it (TOML)
const parseConfig = async function (configPath) {
  try {
    const configString = await fs.readFile(configPath, 'utf8')
    const config = loadToml(configString)
    // Convert `null` prototype objects to normal plain objects
    const { headers = [] } = JSON.parse(JSON.stringify(config))
    if (!Array.isArray(headers)) {
      throw new TypeError(`"headers" must be an array`)
    }
    return headers
  } catch (error) {
    return [new Error(`Could not parse configuration file: ${error}`)]
  }
}
