import { writeFile } from 'fs'
import { fileURLToPath } from 'url'
import { promisify } from 'util'

const pWriteFile = promisify(writeFile)

const headersPath = fileURLToPath(new URL('_headers', import.meta.url))

const buildCommand = async function () {
  await pWriteFile(headersPath, 'test: one')
}

buildCommand()
