import { mkdir, rmdir } from 'fs'
import { dirname } from 'path'
import { promisify } from 'util'

const pMkdir = promisify(mkdir)
const pRmdir = promisify(rmdir)

const DEFAULT_EDGE_HANDLERS_SRC = 'netlify/edge-handlers'

export const onPreBuild = async function ({ constants: { EDGE_HANDLERS_SRC } }) {
  console.log(EDGE_HANDLERS_SRC === undefined)
  await pMkdir(dirname(DEFAULT_EDGE_HANDLERS_SRC))
  await pMkdir(DEFAULT_EDGE_HANDLERS_SRC)
}

export const onBuild = async function ({ constants: { EDGE_HANDLERS_SRC } }) {
  console.log(EDGE_HANDLERS_SRC)
  await pRmdir(DEFAULT_EDGE_HANDLERS_SRC)
}

export const onPostBuild = function ({ constants: { EDGE_HANDLERS_SRC } }) {
  console.log(EDGE_HANDLERS_SRC === undefined)
}
