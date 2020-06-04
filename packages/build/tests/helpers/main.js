const { delimiter } = require('path')
const { env } = require('process')

const { getBinPath } = require('get-bin-path')
const pathKey = require('path-key')

const { runFixtureCommon, FIXTURES_DIR } = require('./common')

const ROOT_DIR = `${__dirname}/../..`
const BUILD_BIN_DIR = `${ROOT_DIR}/node_modules/.bin`

const runFixture = async function(t, fixtureName, { env: envOption, ...opts } = {}) {
  return runFixtureCommon(t, fixtureName, {
    ...opts,
    binaryPath: await BINARY_PATH,
    env: {
      // Ensure local tokens aren't used during development
      NETLIFY_AUTH_TOKEN: '',
      // Allows executing any locally installed Node modules inside tests,
      // regardless of the current directory
      [pathKey()]: `${env[pathKey()]}${delimiter}${BUILD_BIN_DIR}`,
      ...envOption,
    },
  })
}
const BINARY_PATH = getBinPath({ cwd: ROOT_DIR })

module.exports = { runFixture, FIXTURES_DIR }
