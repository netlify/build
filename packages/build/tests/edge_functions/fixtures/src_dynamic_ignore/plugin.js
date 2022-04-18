import { mkdir } from 'fs'
import { dirname } from 'path'
import { promisify } from 'util'

const pMkdir = promisify(mkdir)

const DEFAULT_EDGE_FUNCTIONS_SRC = 'netlify/edge-functions'

export const onPreBuild = async function ({ constants: { EDGE_FUNCTIONS_SRC } }) {
  console.log(EDGE_FUNCTIONS_SRC.endsWith('test'))
  await pMkdir(dirname(DEFAULT_EDGE_FUNCTIONS_SRC))
  await pMkdir(DEFAULT_EDGE_FUNCTIONS_SRC)
}

export const onBuild = function ({ constants: { EDGE_FUNCTIONS_SRC } }) {
  console.log(EDGE_FUNCTIONS_SRC.endsWith('test'))
}
