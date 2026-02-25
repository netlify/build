import { existsSync, promises as fs } from 'fs'

import { throwUserError } from './error.js'
import { throwOnInvalidTomlSequence } from './log/messages.js'
import { parseToml } from './utils/toml.js'

/**
 * Load the configuration file and parse it (TOML)
 * @param configPath The path to the toml file
 * @returns
 */
export const parseConfig = async function (configPath?: string) {
  if (configPath === undefined) {
    return {}
  }

  if (!existsSync(configPath)) {
    throwUserError('Configuration file does not exist')
  }

  return await readConfigPath(configPath)
}

/**
 * Same but `configPath` is required and `configPath` might point to a
 * non-existing file.
 */
export const parseOptionalConfig = async function (configPath: string) {
  if (!existsSync(configPath)) {
    return {}
  }

  return await readConfigPath(configPath)
}

const readConfigPath = async function (configPath: string) {
  const configString = await readConfig(configPath)

  validateTomlBlackslashes(configString)

  try {
    return parseToml(configString)
  } catch (error) {
    throwUserError('Could not parse configuration file', error as Error)
  }
}

/**
 * Reach the configuration file's raw content
 */
const readConfig = async function (configPath: string): Promise<string> {
  try {
    return await fs.readFile(configPath, 'utf8')
  } catch (error) {
    return throwUserError('Could not read configuration file', error as Error)
  }
}

const validateTomlBlackslashes = function (configString: string) {
  const result = INVALID_TOML_BLACKSLASH.exec(configString)
  if (result === null) {
    return
  }

  const [, invalidTripleSequence, invalidSequence = invalidTripleSequence] = result
  throwOnInvalidTomlSequence(invalidSequence)
}

/**
 * The TOML specification forbids unrecognized backslash sequences. However,
 * `toml-node` does not respect the specification and do not fail on those.
 * Therefore, we print a warning message.
 * This only applies to " and """ strings, not ' nor '''
 * Also, """ strings can use trailing backslashes.
 */
const INVALID_TOML_BLACKSLASH =
  /\n[a-zA-Z]+ *= *(?:(?:""".*(?<!\\)(\\[^"\\btnfruU\n]).*""")|(?:"(?!")[^\n]*(?<!\\)(\\[^"\\btnfruU])[^\n]*"))/su
