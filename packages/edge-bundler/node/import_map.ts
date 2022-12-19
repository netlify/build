import { Buffer } from 'buffer'
import { promises as fs } from 'fs'
import { dirname, posix, relative, sep } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

import { parse } from '@import-maps/resolve'

const INTERNAL_IMPORTS = {
  'netlify:edge': 'https://edge.netlify.com/v1/index.ts',
}

type Imports = Record<string, string>

interface ImportMapSource {
  baseURL: URL
  imports: Imports
  scopes?: Record<string, Imports>
}

// ImportMap can take several import map files and merge them into a final
// import map object, also adding the internal imports in the right order.
class ImportMap {
  sources: ImportMapSource[]

  constructor(sources: ImportMapSource[] = []) {
    this.sources = []

    sources.forEach((file) => {
      this.add(file)
    })
  }

  // Transforms an import map by making any relative paths use a different path
  // as a base.
  static resolve(source: ImportMapSource, basePath?: string, prefix = 'file://') {
    const { baseURL, ...importMap } = source
    const parsedImportMap = parse(importMap, baseURL)
    const { imports = {}, scopes = {} } = parsedImportMap
    const resolvedImports = ImportMap.resolveImports(imports, basePath, prefix)
    const resolvedScopes: Record<string, Imports> = {}

    Object.keys(scopes).forEach((path) => {
      const resolvedPath = ImportMap.resolvePath(new URL(path), basePath, prefix)

      resolvedScopes[resolvedPath] = ImportMap.resolveImports(scopes[path], basePath, prefix)
    })

    return { ...parsedImportMap, imports: resolvedImports, scopes: resolvedScopes }
  }

  // Takes an imports object and resolves relative specifiers with a given base
  // path and URL prefix.
  static resolveImports(imports: Record<string, URL | null>, basePath?: string, prefix?: string) {
    const resolvedImports: Record<string, string> = {}

    Object.keys(imports).forEach((specifier) => {
      const url = imports[specifier]

      // If there's no URL, don't even add the specifier to the final imports.
      if (url === null) {
        return
      }

      // If this is a file URL, we might want to transform it to use another
      // base path.
      if (url.protocol === 'file:') {
        resolvedImports[specifier] = ImportMap.resolvePath(url, basePath, prefix)

        return
      }

      resolvedImports[specifier] = url.toString()
    })

    return resolvedImports
  }

  // Takes a URL, turns it into a path relative to the given base, and prepends
  // a prefix (such as the virtual root prefix).
  static resolvePath(url: URL, basePath?: string, prefix?: string) {
    if (basePath === undefined) {
      return url.toString()
    }

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

    return newURL.toString()
  }

  add(source: ImportMapSource) {
    this.sources.push(source)
  }

  async addFile(path: string) {
    const source = await readFile(path)

    if (Object.keys(source.imports).length === 0) {
      return
    }

    return this.add(source)
  }

  async addFiles(paths: (string | undefined)[]) {
    for (const path of paths) {
      if (path === undefined) {
        return
      }

      await this.addFile(path)
    }
  }

  getContents(basePath?: string, prefix?: string) {
    let imports: Imports = {}
    let scopes: Record<string, Imports> = {}

    this.sources.forEach((file) => {
      const importMap = ImportMap.resolve(file, basePath, prefix)

      imports = { ...imports, ...importMap.imports }
      scopes = { ...scopes, ...importMap.scopes }
    })

    // Internal imports must come last, because we need to guarantee that
    // `netlify:edge` isn't user-defined.
    Object.entries(INTERNAL_IMPORTS).forEach((internalImport) => {
      const [specifier, url] = internalImport

      imports[specifier] = url
    })

    return {
      imports,
      scopes,
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

    const contents = this.getContents()

    await fs.writeFile(path, JSON.stringify(contents))
  }
}

const readFile = async (path: string): Promise<ImportMapSource> => {
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
export type { ImportMapSource as ImportMapFile }
