import { writeFile } from 'fs'
import { fileURLToPath } from 'url'
import { promisify } from 'util'

const pWriteFile = promisify(writeFile)

const redirectsPath = fileURLToPath(new URL('_redirects', import.meta.url))

const buildCommand = async function () {
  await pWriteFile(redirectsPath, '/from /to')
}

buildCommand()
