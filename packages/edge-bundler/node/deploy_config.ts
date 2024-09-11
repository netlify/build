import { promises as fs } from 'fs'
import { dirname, resolve } from 'path'

import type { Declaration } from './declaration.js'
import type { Layer } from './layer.js'
import type { Logger } from './logger.js'
import { isFileNotFoundError } from './utils/error.js'

interface DeployConfigFile {
  functions?: Declaration[]
  import_map?: string
  layers?: Layer[]
  version: number
}

export interface DeployConfig {
  declarations: Declaration[]
  importMap?: string
  layers: Layer[]
}

export const load = async (path: string | undefined, logger: Logger): Promise<DeployConfig> => {
  if (path === undefined) {
    return {
      declarations: [],
      layers: [],
    }
  }

  try {
    const data = await fs.readFile(path, 'utf8')
    const config = JSON.parse(data) as DeployConfigFile

    return parse(config, path)
  } catch (error) {
    if (!isFileNotFoundError(error)) {
      logger.system('Error while parsing internal edge functions manifest:', error)
    }
  }

  return {
    declarations: [],
    layers: [],
  }
}

const parse = (data: DeployConfigFile, path: string) => {
  if (data.version !== 1) {
    throw new Error(`Unsupported file version: ${data.version}`)
  }

  const config: DeployConfig = {
    declarations: data.functions ?? [],
    layers: data.layers ?? [],
  }

  if (data.import_map) {
    const importMapPath = resolve(dirname(path), data.import_map)

    config.importMap = importMapPath
  }

  return config
}
