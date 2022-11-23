import { Buffer } from 'buffer'
import { promises as fs } from 'fs'
import { dirname } from 'path'
import { pathToFileURL } from 'url'

import { parse } from '@import-maps/resolve'

const INTERNAL_IMPORTS = {
  'netlify:edge': new URL('https://edge.netlify.com/v1/index.ts'),
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

  static resolve(importMapFile: ImportMapFile) {
    const { baseURL, ...importMap } = importMapFile
    const parsedImportMap = parse(importMap, baseURL)

    return parsedImportMap
  }

  add(file: ImportMapFile) {
    this.files.push(file)
  }

  getContents() {
    let imports: Record<string, URL | null> = {}

    this.files.forEach((file) => {
      const importMap = ImportMap.resolve(file)

      imports = { ...imports, ...importMap.imports }
    })

    // Internal imports must come last, because we need to guarantee that
    // `netlify:edge` isn't user-defined.
    Object.entries(INTERNAL_IMPORTS).forEach((internalImport) => {
      const [specifier, url] = internalImport

      imports[specifier] = url
    })
    const contents = {
      imports,
    }

    return JSON.stringify(contents)
  }

  toDataURL() {
    const encodedImportMap = Buffer.from(this.getContents()).toString('base64')

    return `data:application/json;base64,${encodedImportMap}`
  }

  async writeToFile(path: string) {
    await fs.mkdir(dirname(path), { recursive: true })

    const contents = this.getContents()

    await fs.writeFile(path, contents)
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
