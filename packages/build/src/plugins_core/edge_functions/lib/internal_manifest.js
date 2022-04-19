import { promises as fs } from 'fs'
import { dirname, join, resolve } from 'path'

const parseManifest = async (internalSourceDirectory) => {
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
        importMap,
      }
    }

    return result
  } catch {
    // no-op
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
