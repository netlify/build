import { existsSync, promises as fs } from 'fs'

import { throwUserError } from './error.js'
import { throwOnInvalidTomlSequence } from './log/messages.js'
import type { PartialNetlifyConfig } from './types/config.js'
import { parseToml } from './utils/toml.js'

/**
 * Unknown backslash escapes in `"` and `"""` strings (not `'` and `'''`) are invalid TOML; catch them
 * first so the error can suggest the escaped form. `"""` strings may end lines with a backslash.
 */
const INVALID_TOML_BACKSLASH =
  /\n[a-zA-Z]+ *= *(?:(?:""".*(?<!\\)(\\[^"\\btnfruU\n]).*""")|(?:"(?!")[^\n]*(?<!\\)(\\[^"\\btnfruU])[^\n]*"))/su

/** Read and parse the configuration file. Without a path, the configuration is empty. */
export const parseConfig = async function (configPath?: string): Promise<PartialNetlifyConfig> {
  if (configPath === undefined) {
    return {}
  }

  if (!existsSync(configPath)) {
    throwUserError('Configuration file does not exist')
  }

  return await readConfigFile(configPath)
}

/** Read and parse the configuration file if it exists. */
export const parseOptionalConfig = async function (configPath: string): Promise<PartialNetlifyConfig> {
  if (!existsSync(configPath)) {
    return {}
  }

  return await readConfigFile(configPath)
}

// A TOML document is always a table. Its properties are validated later.
const readConfigFile = async function (configPath: string): Promise<PartialNetlifyConfig> {
  const configString = await readConfig(configPath)
  validateTomlBackslashes(configString)

  try {
    return parseToml(configString) as PartialNetlifyConfig
  } catch (error) {
    throwUserError('Could not parse configuration file', error)
  }
}

const readConfig = async function (configPath: string): Promise<string> {
  try {
    return await fs.readFile(configPath, 'utf8')
  } catch (error) {
    throwUserError('Could not read configuration file', error)
  }
}

const validateTomlBackslashes = function (configString: string) {
  const result = INVALID_TOML_BACKSLASH.exec(configString)
  if (result === null) {
    return
  }

  // One of the two groups matches.
  const [, invalidTripleQuotedSequence, invalidSequence = invalidTripleQuotedSequence] = result
  throwOnInvalidTomlSequence(invalidSequence ?? '')
}
