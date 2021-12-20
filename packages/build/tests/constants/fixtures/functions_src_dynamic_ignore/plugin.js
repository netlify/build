import { mkdir } from 'fs'
import { dirname } from 'path'
import { promisify } from 'util'

const pMkdir = promisify(mkdir)

const DEFAULT_FUNCTIONS_SRC = 'netlify/functions'

export default {
  async onPreBuild({ constants: { FUNCTIONS_SRC } }) {
    console.log(FUNCTIONS_SRC.endsWith('test'))
    await pMkdir(dirname(DEFAULT_FUNCTIONS_SRC))
    await pMkdir(DEFAULT_FUNCTIONS_SRC)
  },
  onBuild({ constants: { FUNCTIONS_SRC } }) {
    console.log(FUNCTIONS_SRC.endsWith('test'))
  },
}
