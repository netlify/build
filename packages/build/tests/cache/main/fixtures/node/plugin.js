const { writeFile, readFile } = require('fs')
const { promisify } = require('util')

const makeDir = require('make-dir')
const del = require('del')

const DUMMY_VALUE = `module.exports = ${Math.random()}`

const pWriteFile = promisify(writeFile)
const pReadFile = promisify(readFile)

module.exports = {
  name: 'netlify-plugin-test',
  async preSaveCache({ constants: { CACHE_DIR } }) {
    await Promise.all([del(`${CACHE_DIR}/node_modules`), makeDir('node_modules/test')])
    await pWriteFile('node_modules/test/test.js', DUMMY_VALUE)
  },
  async postSaveCache({ constants: { CACHE_DIR } }) {
    const value = await pReadFile(`${CACHE_DIR}/node_modules/test/test.js`, 'utf8')
    console.log(value === DUMMY_VALUE)
  },
}
