import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'

const headersPath = fileURLToPath(new URL('_headers', import.meta.url))

const buildCommand = async function () {
  await fs.writeFile(headersPath, '/path\n  test: one')
}

buildCommand()
