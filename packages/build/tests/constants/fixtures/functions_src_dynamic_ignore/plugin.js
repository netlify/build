import { mkdir } from 'fs'
import { dirname } from 'path'
import { promisify } from 'util'

const pMkdir = promisify(mkdir)

const DEFAULT_FUNCTIONS_SRC = 'netlify/functions'

export const onPreBuild = async function ({ constants: { FUNCTIONS_SRC } }) {
  console.log(FUNCTIONS_SRC.endsWith('test'))
  await pMkdir(dirname(DEFAULT_FUNCTIONS_SRC))
  await pMkdir(DEFAULT_FUNCTIONS_SRC)
}

export const onBuild = function ({ constants: { FUNCTIONS_SRC } }) {
  console.log(FUNCTIONS_SRC.endsWith('test'))
}
