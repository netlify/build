import { mkdir, rmdir } from 'fs'
import { dirname } from 'path'
import { promisify } from 'util'

const pMkdir = promisify(mkdir)
const pRmdir = promisify(rmdir)

const DEFAULT_FUNCTIONS_SRC = 'netlify/functions'

export const onPreBuild = async function ({ constants: { FUNCTIONS_SRC } }) {
  console.log(FUNCTIONS_SRC === undefined)
  await pMkdir(dirname(DEFAULT_FUNCTIONS_SRC))
  await pMkdir(DEFAULT_FUNCTIONS_SRC)
}

export const onBuild = async function ({ constants: { FUNCTIONS_SRC } }) {
  console.log(FUNCTIONS_SRC)
  await pRmdir(DEFAULT_FUNCTIONS_SRC)
  await pRmdir(dirname(DEFAULT_FUNCTIONS_SRC))
}

export const onPostBuild = function ({ constants: { FUNCTIONS_SRC } }) {
  console.log(FUNCTIONS_SRC === undefined)
}
