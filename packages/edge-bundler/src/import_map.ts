import { Buffer } from 'buffer'
import { promises as fs } from 'fs'
import { dirname } from 'path'

const INTERNAL_IMPORTS = {
  'netlify:edge': 'https://edge.netlify.com/v1/index.ts',
}

interface ImportMapFile {
  imports: Record<string, string>
  scopes?: Record<string, string>
}

class ImportMap {
  imports: Record<string, string>

  constructor(input: ImportMapFile[] = []) {
    const inputImports = input.reduce((acc, { imports }) => ({ ...acc, ...imports }), {})

    // `INTERNAL_IMPORTS` must come last,
    // because we need to guarantee `netlify:edge` isn't user-defined.
    this.imports = { ...inputImports, ...INTERNAL_IMPORTS }
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
