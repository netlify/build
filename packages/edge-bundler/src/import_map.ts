import { Buffer } from 'buffer'
import { promises as fs } from 'fs'
import { dirname } from 'path'

const DEFAULT_IMPORTS = {
  'netlify:edge': 'https://dinosaurs:are-the-future!@edge-bootstrap.netlify.app/v1/index.ts',
}

class ImportMap {
  imports: Record<string, string>

  constructor() {
    this.imports = DEFAULT_IMPORTS
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
