import { writeFile } from 'fs'
import { fileURLToPath } from 'url'
import { promisify } from 'util'

const pWriteFile = promisify(writeFile)

const headersPath = fileURLToPath(new URL('test/_headers', import.meta.url))

const buildCommand = async function () {
  await pWriteFile(headersPath, '/path\n  test: one')
}

buildCommand()
