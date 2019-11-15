const { writeFile, readFile } = require('fs')
const { promisify } = require('util')
const { dirname } = require('path')
const {
  env: { CACHE_PATH },
} = require('process')

const makeDir = require('make-dir')
const del = require('del')

const pWriteFile = promisify(writeFile)
const pReadFile = promisify(readFile)

const DUMMY_VALUE = String(Math.random())

module.exports = {
  name: 'netlify-plugin-test',
  async preSaveCache({ constants: { CACHE_DIR } }) {
    await del(`${CACHE_DIR}/${CACHE_PATH}`)

    await makeDir(dirname(CACHE_PATH))
    await pWriteFile(CACHE_PATH, DUMMY_VALUE)
  },
  async postSaveCache({ constants: { CACHE_DIR } }) {
    const [sourceDir] = CACHE_PATH.split('/')
    await del(sourceDir)

    const value = await pReadFile(`${CACHE_DIR}/${CACHE_PATH}`, 'utf8')
    console.log(value === DUMMY_VALUE)
  },
}
