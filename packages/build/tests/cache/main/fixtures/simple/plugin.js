const { writeFile, readFile } = require('fs')
const { promisify } = require('util')
const { dirname } = require('path')
const {
  env: { CACHE_PATH },
} = require('process')

const makeDir = require('make-dir')
const del = require('del')

const cachePath = `${CACHE_PATH}/test/test`

const pWriteFile = promisify(writeFile)
const pReadFile = promisify(readFile)

const DUMMY_VALUE = String(Math.random())

module.exports = {
  name: 'netlify-plugin-test',
  async preSaveCache({ constants: { CACHE_DIR } }) {
    await del(`${CACHE_DIR}/${cachePath}`)

    await makeDir(dirname(cachePath))
    await pWriteFile(cachePath, DUMMY_VALUE)
  },
  async postSaveCache({ constants: { CACHE_DIR } }) {
    const [sourceDir] = cachePath.split('/')
    await del(sourceDir)

    const value = await pReadFile(`${CACHE_DIR}/${cachePath}`, 'utf8')
    console.log(value === DUMMY_VALUE)
  },
}
