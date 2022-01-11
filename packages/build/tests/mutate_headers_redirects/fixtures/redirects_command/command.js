import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'

const redirectsPath = fileURLToPath(new URL('_redirects', import.meta.url))

const buildCommand = async function () {
  await fs.writeFile(redirectsPath, '/from /to')
}

buildCommand()
