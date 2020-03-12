const { writeFile, readFile } = require('fs')
const { promisify } = require('util')
const { dirname } = require('path')
const {
  env: { TEST_CACHE_PATH },
} = require('process')

// eslint-disable-next-line node/no-extraneous-require
const makeDir = require('make-dir')
// eslint-disable-next-line node/no-extraneous-require
const del = require('del')

const cachePath = `${TEST_CACHE_PATH}/test/test`

const pWriteFile = promisify(writeFile)
const pReadFile = promisify(readFile)

const DUMMY_VALUE = String(Math.random())

module.exports = {
  name: 'netlify-plugin-test',
  async onPreBuild({ utils: { cache } }) {
    await cache.remove(TEST_CACHE_PATH)
    await makeDir(dirname(cachePath))
    await pWriteFile(cachePath, DUMMY_VALUE)
  },
  async onPostBuild({ utils: { cache } }) {
    await del(TEST_CACHE_PATH, { force: true })
    await cache.restore(TEST_CACHE_PATH)
    const value = await pReadFile(cachePath, 'utf8')
    console.log(value === DUMMY_VALUE)
    await del(TEST_CACHE_PATH, { force: true })
  },
}
