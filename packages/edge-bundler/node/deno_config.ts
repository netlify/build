import { promises as fs } from 'fs'
import { join, resolve } from 'path'

import { parse as parseJSONC } from 'jsonc-parser'

import { Logger } from './logger.js'
import { isNodeError } from './utils/error.js'

interface DenoConfigFile {
  importMap?: string
}

const filenames = ['deno.json', 'deno.jsonc']

export const getConfig = async (logger: Logger, basePath?: string) => {
  if (basePath === undefined) {
    logger.system('No base path specified, will not attempt to read Deno config')

    return
  }

  for (const filename of filenames) {
    const candidatePath = join(basePath, filename)
    const config = await getConfigFromFile(candidatePath)

    if (config !== undefined) {
      logger.system('Loaded Deno config file from path', candidatePath)

      return normalizeConfig(config, basePath)
    }
  }

  logger.system('No Deno config file found at base path', basePath)
}

const getConfigFromFile = async (filePath: string) => {
  try {
    const data = await fs.readFile(filePath, 'utf8')
    const config = parseJSONC(data) as DenoConfigFile

    return config
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return
    }

    return {}
  }
}

const normalizeConfig = (rawConfig: DenoConfigFile, basePath: string) => {
  const config: DenoConfigFile = {}

  if (rawConfig.importMap) {
    if (typeof rawConfig.importMap !== 'string') {
      throw new TypeError(`'importMap' property in Deno config must be a string`)
    }

    config.importMap = resolve(basePath, rawConfig.importMap)
  }

  return config
}
