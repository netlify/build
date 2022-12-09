import { Buffer } from 'buffer'
import { promises as fs } from 'fs'
import { dirname, posix, relative, sep } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

import { parse } from '@import-maps/resolve'

const INTERNAL_IMPORTS = {
  'netlify:edge': 'https://edge.netlify.com/v1/index.ts',
}

interface ImportMapFile {
  baseURL: URL
  imports: Record<string, string>
  scopes?: Record<string, Record<string, string>>
}

// ImportMap can take several import map files and merge them into a final
// import map object, also adding the internal imports in the right order.
class ImportMap {
  files: ImportMapFile[]

  constructor(files: ImportMapFile[] = []) {
    this.files = []

    files.forEach((file) => {
      this.add(file)
    })
  }

  // Transforms an import map by making any relative paths use a different path
  // as a base.
  static resolve(importMapFile: ImportMapFile, basePath?: string, prefix = 'file://') {
    const { baseURL, ...importMap } = importMapFile
    const parsedImportMap = parse(importMap, baseURL)
    const { imports = {} } = parsedImportMap
    const newImports: Record<string, string> = {}

    Object.keys(imports).forEach((specifier) => {
      const url = imports[specifier]

      // If there's no URL, don't even add the specifier to the final imports.
      if (url === null) {
        return
      }

      // If this is a file URL, we might want to transform it to use another
      // base path, as long as one is provided.
      if (url.protocol === 'file:' && basePath !== undefined) {
        const path = fileURLToPath(url)
        const relativePath = relative(basePath, path)

        if (relativePath.startsWith('..')) {
          throw new Error(`Import map cannot reference '${path}' as it's outside of the base directory '${basePath}'`)
        }

        // We want to use POSIX paths for the import map regardless of the OS
        // we're building in.
        let normalizedPath = relativePath.split(sep).join(posix.sep)

        // If the original URL had a trailing slash, ensure the normalized path
        // has one too.
        if (normalizedPath !== '' && url.pathname.endsWith(posix.sep) && !normalizedPath.endsWith(posix.sep)) {
          normalizedPath += posix.sep
        }

        const newURL = new URL(normalizedPath, prefix)

        newImports[specifier] = newURL.toString()

        return
      }

      newImports[specifier] = url.toString()
    })

    return { ...parsedImportMap, imports: newImports }
  }

  add(file: ImportMapFile) {
    this.files.push(file)
  }

  getContents(basePath?: string, prefix?: string) {
    let imports: Record<string, string> = {}

    this.files.forEach((file) => {
      const importMap = ImportMap.resolve(file, basePath, prefix)

      imports = { ...imports, ...importMap.imports }
    })

    // Internal imports must come last, because we need to guarantee that
    // `netlify:edge` isn't user-defined.
    Object.entries(INTERNAL_IMPORTS).forEach((internalImport) => {
      const [specifier, url] = internalImport

      imports[specifier] = url
    })

    return {
      imports,
    }
  }

  toDataURL() {
    const data = JSON.stringify(this.getContents())
    const encodedImportMap = Buffer.from(data).toString('base64')

    return `data:application/json;base64,${encodedImportMap}`
  }

  async writeToFile(path: string) {
    const distDirectory = dirname(path)

    await fs.mkdir(distDirectory, { recursive: true })

    const contents = this.getContents(distDirectory)

    await fs.writeFile(path, JSON.stringify(contents))
  }
}

const readFile = async (path: string): Promise<ImportMapFile> => {
  const baseURL = pathToFileURL(path)

  try {
    const data = await fs.readFile(path, 'utf8')
    const importMap = JSON.parse(data)

    return {
      ...importMap,
      baseURL,
    }
  } catch {
    // no-op
  }

  return {
    baseURL,
    imports: {},
  }
}

export { ImportMap, readFile }
export type { ImportMapFile }
