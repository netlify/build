import { Buffer } from 'node:buffer'
import { promises as fs } from 'node:fs'
import { builtinModules } from 'node:module'
import { dirname, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { parse, ParsedImportMap } from '@import-maps/resolve'

import { Logger } from './logger.js'
import { isFileNotFoundError } from './utils/error.js'

const INTERNAL_IMPORTS = {
  '@netlify/edge-functions': 'https://edge.netlify.com/v1/index.ts',
  'netlify:edge': 'https://edge.netlify.com/v1/index.ts?v=legacy',
}

type Imports = Record<string, string>

export interface ImportMapFile {
  baseURL: URL
  imports?: Imports
  scopes?: Record<string, Imports>
}

// ImportMap can take several import map files and merge them into a final
// import map object, also adding the internal imports in the right order.
export class ImportMap {
  // The root path which import maps can reference. If an import map attempts
  // to reference a file outside this directory, an error will be thrown.
  rootPath: string | null

  // The different import map files that make up the wider import map.
  sources: ImportMapFile[]

  constructor(sources: ImportMapFile[] = [], rootPath: string | null = null) {
    this.rootPath = rootPath
    this.sources = []

    sources.forEach((file) => {
      this.add(file)
    })
  }

  add(source: ImportMapFile) {
    this.sources.push(source)
  }

  async addFile(path: string, logger: Logger) {
    const source = await ImportMap.readFile(path, logger)

    return this.add(source)
  }

  async addFiles(paths: (string | undefined)[], logger: Logger) {
    for (const path of paths) {
      if (path === undefined) {
        continue
      }

      await this.addFile(path, logger)
    }
  }

  // Applies a list of prefixes to an `imports` block, by transforming values
  // with the `applyPrefixesToPath` method.
  static applyPrefixesToImports(imports: Imports, prefixes: Record<string, string>): Imports {
    return Object.entries(imports).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: ImportMap.applyPrefixesToPath(value, prefixes),
      }),
      {},
    )
  }

  clone() {
    return new ImportMap(this.sources, this.rootPath)
  }

  static convertImportsToURLObjects(imports: Imports) {
    return Object.entries(imports).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: new URL(value),
      }),
      {} as Record<string, URL>,
    )
  }

  static convertScopesToURLObjects(scopes: Record<string, Imports>) {
    return Object.entries(scopes).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: ImportMap.convertImportsToURLObjects(value),
      }),
      {} as Record<string, Record<string, URL>>,
    )
  }

  // Applies a list of prefixes to a given path, returning the replaced path.
  // For example, given a `path` of `file:///foo/bar/baz.js` and a `prefixes`
  // object with `{"file:///foo/": "file:///hello/"}`, this method will return
  // `file:///hello/bar/baz.js`. If no matching prefix is found, the original
  // path is returned.
  static applyPrefixesToPath(path: string, prefixes: Record<string, string>) {
    for (const prefix in prefixes) {
      if (path.startsWith(prefix)) {
        return path.replace(prefix, prefixes[prefix])
      }
    }

    return path
  }

  // Takes an `imports` object and filters out any entries without a URL. Also,
  // it checks whether the import map is referencing a path outside `rootPath`,
  // if one is set.
  filterImports(imports: Record<string, URL | null> = {}) {
    const filteredImports: Record<string, string> = {}

    Object.keys(imports).forEach((specifier) => {
      const url = imports[specifier]

      // If there's no URL, don't even add the specifier to the final imports.
      if (url === null) {
        return
      }

      if (this.rootPath !== null) {
        const path = fileURLToPath(url)
        const relativePath = relative(this.rootPath, path)

        if (relativePath.startsWith('..')) {
          throw new Error(
            `Import map cannot reference '${path}' as it's outside of the base directory '${this.rootPath}'`,
          )
        }
      }

      filteredImports[specifier] = url.toString()
    })

    return filteredImports
  }

  // Takes a `scopes` object and runs all imports through `filterImports`,
  // omitting any scopes for which there are no imports.
  filterScopes(scopes?: ParsedImportMap['scopes']) {
    const filteredScopes: Record<string, Imports> = {}

    if (scopes !== undefined) {
      Object.keys(scopes).forEach((url) => {
        const imports = this.filterImports(scopes[url])

        if (Object.keys(imports).length === 0) {
          return
        }

        filteredScopes[url] = imports
      })
    }

    return filteredScopes
  }

  // Returns the import map as a plain object, with any relative paths resolved
  // to full URLs. It takes an optional `prefixes` object that specifies a list
  // of prefixes to replace path prefixes (see `applyPrefixesToPath`). Prefixes
  // will be applied on both `imports` and `scopes`.
  getContents(prefixes: Record<string, string> = {}) {
    let imports: Imports = {}
    let scopes: Record<string, Imports> = {}

    this.sources.forEach((file) => {
      const importMap = this.resolve(file)

      imports = { ...imports, ...importMap.imports }
      scopes = { ...scopes, ...importMap.scopes }
    })

    // Internal imports must come last, because we need to guarantee that
    // `netlify:edge` isn't user-defined.
    Object.entries(INTERNAL_IMPORTS).forEach((internalImport) => {
      const [specifier, url] = internalImport

      imports[specifier] = url
    })

    const transformedImports = ImportMap.applyPrefixesToImports(imports, prefixes)
    const transformedScopes = Object.entries(scopes).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [ImportMap.applyPrefixesToPath(key, prefixes)]: ImportMap.applyPrefixesToImports(value, prefixes),
      }),
      {},
    )

    return {
      imports: transformedImports,
      scopes: transformedScopes,
    }
  }

  getContentsWithRelativePaths() {
    let imports: Imports = {}
    let scopes: Record<string, Imports> = {}

    this.sources.forEach((file) => {
      imports = { ...imports, ...file.imports }
      scopes = { ...scopes, ...file.scopes }
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

  // The same as `getContents`, but the URLs are represented as URL objects
  // instead of strings. This is compatible with the `ParsedImportMap` type
  // from the `@import-maps/resolve` library.
  getContentsWithURLObjects(prefixes: Record<string, string> = {}) {
    const { imports, scopes } = this.getContents(prefixes)

    return {
      imports: ImportMap.convertImportsToURLObjects(imports),
      scopes: ImportMap.convertScopesToURLObjects(scopes),
    }
  }

  static async readFile(path: string, logger: Logger): Promise<ImportMapFile> {
    const baseURL = pathToFileURL(path)

    try {
      const data = await fs.readFile(path, 'utf8')
      const importMap = JSON.parse(data)

      return {
        ...importMap,
        baseURL,
      }
    } catch (error) {
      if (isFileNotFoundError(error)) {
        logger.system(`Did not find an import map file at '${path}'.`)
      } else {
        logger.user(`Error while loading import map at '${path}':`, error)
      }
    }

    return {
      baseURL,
      imports: {},
    }
  }

  // Resolves an import map file by transforming all relative paths into full
  // URLs. The `baseURL` property of each file is used to resolve all relative
  // paths against.
  resolve(source: ImportMapFile) {
    const { baseURL, ...importMap } = source
    const parsedImportMap = parse(importMap, baseURL)
    const imports = this.filterImports(parsedImportMap.imports)
    const scopes = this.filterScopes(parsedImportMap.scopes)

    return { ...parsedImportMap, imports, scopes }
  }

  toDataURL() {
    const data = JSON.stringify(this.getContents())
    const encodedImportMap = Buffer.from(data).toString('base64')

    return `data:application/json;base64,${encodedImportMap}`
  }

  // Adds an import map source mapping Node.js built-in modules to their prefixed
  // version (e.g. "path" => "node:path").
  withNodeBuiltins() {
    const imports: Record<string, string> = {}

    for (const name of builtinModules) {
      imports[name] = `node:${name}`
    }

    this.sources.push({
      baseURL: new URL(import.meta.url),
      imports,
    })

    return this
  }

  async writeToFile(path: string) {
    const distDirectory = dirname(path)

    await fs.mkdir(distDirectory, { recursive: true })

    const contents = this.getContents()

    await fs.writeFile(path, JSON.stringify(contents))
  }
}
