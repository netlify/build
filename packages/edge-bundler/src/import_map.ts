import { Buffer } from 'buffer'
import { promises as fs } from 'fs'
import { dirname } from 'path'

import { parse } from '@import-maps/resolve'

const INTERNAL_IMPORTS = {
  'netlify:edge': new URL('https://edge.netlify.com/v1/index.ts'),
}

interface ImportMapFile {
  baseURL: URL
  imports: Record<string, string>
  scopes?: Record<string, Record<string, string>>
}

class ImportMap {
  imports: Record<string, URL | null>

  constructor(files: ImportMapFile[] = []) {
    let imports: ImportMap['imports'] = {}

    files.forEach((file) => {
      const importMap = ImportMap.resolve(file)

      imports = { ...imports, ...importMap.imports }
    })

    // Internal imports must come last, because we need to guarantee that
    // `netlify:edge` isn't user-defined.
    Object.entries(INTERNAL_IMPORTS).forEach((internalImport) => {
      const [specifier, url] = internalImport

      imports[specifier] = url
    })

    this.imports = imports
  }

  static resolve(importMapFile: ImportMapFile) {
    const { baseURL, ...importMap } = importMapFile
    const parsedImportMap = parse(importMap, baseURL)

    return parsedImportMap
  }

  getContents() {
    const contents = {
      imports: this.imports,
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

export { ImportMap }
export type { ImportMapFile }
