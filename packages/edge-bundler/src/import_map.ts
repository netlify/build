import { Buffer } from 'buffer'
import { promises as fs } from 'fs'
import { dirname } from 'path'

const DEFAULT_IMPORTS = {
  'netlify:edge': 'https://dinosaurs:are-the-future!@edge-bootstrap.netlify.app/v1/index.ts',
}

interface ImportMapFile {
  imports: Record<string, string>
  scopes?: Record<string, string>
}

class ImportMap {
  imports: Record<string, string>

  constructor(input: ImportMapFile[] = []) {
    const inputImports = input.reduce((acc, { imports }) => ({ ...acc, ...imports }), {})

    // `DEFAULT_IMPORTS` must come last because we want our internal imports to
    // take precedence.
    this.imports = { ...inputImports, ...DEFAULT_IMPORTS }
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
