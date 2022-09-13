import { promises as fs } from 'fs'
import { dirname, join, resolve } from 'path'
import { pathToFileURL } from 'url'

const parseManifest = async (internalSourceDirectory, systemLog) => {
  const manifestPath = join(internalSourceDirectory, 'manifest.json')

  try {
    const data = await fs.readFile(manifestPath)
    const manifest = JSON.parse(data)

    if (manifest.version !== 1) {
      throw new Error('Unsupported manifest version')
    }

    const result = {
      declarations: manifest.functions,
    }

    if (manifest.import_map) {
      const importMapPath = resolve(dirname(manifestPath), manifest.import_map)
      const importMap = await readImportMap(importMapPath)

      return {
        ...result,
        importMap: {
          baseURL: pathToFileURL(importMapPath),
          ...importMap,
        },
      }
    }

    return result
  } catch (error) {
    if (error.code !== 'ENOENT') {
      systemLog('Error while parsing internal edge functions manifest:', error)
    }
  }

  return {
    declarations: [],
  }
}

const readImportMap = async (path) => {
  try {
    const data = await fs.readFile(path)
    const importMap = JSON.parse(data)

    return importMap
  } catch {
    // no-op
  }

  return {
    imports: {},
  }
}

export { parseManifest }
