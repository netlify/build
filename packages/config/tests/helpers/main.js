'use strict'

const { stableStringify } = require('fast-safe-stringify')
const { getBinPath } = require('get-bin-path')

// Tests require the full monorepo to be present at the moment
// TODO: split tests utility into its own package
const resolveConfig = require('../..')
const { runFixtureCommon, FIXTURES_DIR, startServer } = require('../../../build/tests/helpers/common')

const ROOT_DIR = `${__dirname}/../..`

const getFixtureConfig = async function (t, fixtureName, opts) {
  const { returnValue } = await runFixture(t, fixtureName, { snapshot: false, ...opts })
  try {
    return JSON.parse(returnValue)
  } catch (error) {
    return returnValue
  }
}

const runFixture = async function (t, fixtureName, { flags = {}, env, ...opts } = {}) {
  const binaryPath = await BINARY_PATH
  const flagsA = { stable: true, buffer: true, branch: 'branch', ...flags }
  // Ensure local environment variables aren't used during development
  const envA = { NETLIFY_AUTH_TOKEN: '', ...env }
  return runFixtureCommon(t, fixtureName, { ...opts, flags: flagsA, env: envA, mainFunc, binaryPath })
}

// In tests, make the return value stable so it can be snapshot
const mainFunc = async function (flags) {
  const { logs: { stdout = [], stderr = [] } = {}, ...result } = await resolveConfig(flags)
  const resultA = serializeApi(result)
  const resultB = stableStringify(resultA, null, 2)
  const resultC = [stdout.join('\n'), stderr.join('\n'), resultB].filter(Boolean).join('\n\n')
  return resultC
}

const serializeApi = function ({ api, ...result }) {
  if (api === undefined) {
    return result
  }

  return { ...result, hasApi: true }
}

// Use a top-level promise so it's only performed once at load time
const BINARY_PATH = getBinPath({ cwd: ROOT_DIR })

module.exports = { getFixtureConfig, runFixture, FIXTURES_DIR, startServer }
