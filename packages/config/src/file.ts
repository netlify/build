import { existsSync } from 'fs'
import { readFile } from 'fs/promises'
import { join, resolve } from 'path'

import { findUp } from 'find-up'

import { throwUserError } from './error.js'
import { parseToml } from './toml.js'
import type { RawConfig } from './types.js'

const FILENAME = 'netlify.toml'

/** The configuration file to use, if any, in the order of SPEC §6.1. */
export const findConfigFile = async function ({
  config,
  cwd,
  repositoryRoot,
  configBase,
  packagePath,
}: {
  config: string | undefined
  cwd: string
  repositoryRoot: string
  configBase: string | undefined
  packagePath: string | undefined
}): Promise<string | undefined> {
  // Chosen even when missing, so that `readConfigFile` reports it.
  if (config !== undefined) {
    return resolve(cwd, config)
  }

  // With a package path, `{base}/netlify.toml` is not searched.
  if (configBase !== undefined || packagePath !== undefined) {
    const baseConfigPath = findInDirectory(join(configBase ?? repositoryRoot, packagePath ?? ''))
    if (baseConfigPath !== undefined) {
      return baseConfigPath
    }
  }

  // Not bounded by the repository root.
  return findInDirectory(repositoryRoot) ?? (await findUp(FILENAME, { cwd }))
}

// A directory named `netlify.toml` counts, and fails when read.
const findInDirectory = function (directory: string): string | undefined {
  const path = resolve(directory, FILENAME)
  return existsSync(path) ? path : undefined
}

export const readConfigFile = async function (configPath: string | undefined): Promise<RawConfig> {
  if (configPath === undefined) {
    return {}
  }

  if (!existsSync(configPath)) {
    throwUserError('Configuration file does not exist')
  }

  return await parseConfigFile(configPath)
}

export const readOptionalConfigFile = async function (configPath: string): Promise<RawConfig> {
  if (!existsSync(configPath)) {
    return {}
  }

  return await parseConfigFile(configPath)
}

const parseConfigFile = async function (configPath: string): Promise<RawConfig> {
  const text = await readText(configPath)
  checkBackslashes(text)

  try {
    return parseToml(text)
  } catch (error) {
    throwUserError('Could not parse configuration file', error)
  }
}

const readText = async function (configPath: string): Promise<string> {
  try {
    return await readFile(configPath, 'utf8')
  } catch (error) {
    throwUserError('Could not read configuration file', error)
  }
}

// Caught before parsing, to suggest the escaped form. QUIRK: only keys of ASCII letters at the start
// of a line are checked, and with the `s` flag the `"""` branch can span several strings.
const INVALID_BACKSLASH =
  /\n[a-zA-Z]+ *= *(?:(?:""".*(?<!\\)(\\[^"\\btnfruU\n]).*""")|(?:"(?!")[^\n]*(?<!\\)(\\[^"\\btnfruU])[^\n]*"))/su

const checkBackslashes = function (text: string): void {
  const match = INVALID_BACKSLASH.exec(text)
  if (match === null) {
    return
  }

  const [, tripleQuotedSequence, singleQuotedSequence] = match
  const sequence = singleQuotedSequence ?? tripleQuotedSequence ?? ''
  throwUserError(`In netlify.toml, the following backslash should be escaped: ${sequence}
The following should be used instead: \\${sequence}`)
}
