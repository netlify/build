const { delimiter, normalize } = require('path')
const { env } = require('process')

const { getBinPath } = require('get-bin-path')
const pathKey = require('path-key')

const netlifyBuild = require('../../')

const { runFixtureCommon, FIXTURES_DIR } = require('./common')

const ROOT_DIR = `${__dirname}/../..`
const BUILD_BIN_DIR = normalize(`${ROOT_DIR}/node_modules/.bin`)

const runFixture = async function(t, fixtureName, { flags = {}, env: envOption = {}, ...opts } = {}) {
  const binaryPath = await BINARY_PATH
  const flagsA = {
    debug: true,
    telemetry: false,
    buffer: true,
    testOpts: { sendStatus: false, ...flags.testOpts },
    ...flags,
  }
  const envOptionA = {
    // Ensure local environment variables aren't used during development
    BUILD_TELEMETRY_DISABLED: '',
    NETLIFY_AUTH_TOKEN: '',
    // Allows executing any locally installed Node modules inside tests,
    // regardless of the current directory.
    // This is needed for example to run `yarn` in tests in environments that
    // do not have a global binary of `yarn`.
    [pathKey()]: `${env[pathKey()]}${delimiter}${BUILD_BIN_DIR}`,
    ...envOption,
  }
  return runFixtureCommon(t, fixtureName, { ...opts, flags: flagsA, env: envOptionA, mainFunc, binaryPath })
}

const mainFunc = async function(flags) {
  const { logs } = await netlifyBuild(flags)
  return [logs.stdout.join('\n'), logs.stderr.join('\n')].filter(Boolean).join('\n\n')
}

// Use a top-level promise so it's only performed once at load time
const BINARY_PATH = getBinPath({ cwd: ROOT_DIR })

module.exports = { runFixture, FIXTURES_DIR }
