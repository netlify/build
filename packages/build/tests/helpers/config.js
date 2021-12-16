'use strict'

const fastSafeStringify = require('fast-safe-stringify')
const { getBinPath } = require('get-bin-path')

// Tests require the full monorepo to be present at the moment
// TODO: split tests utility into its own package
const { runFixtureCommon } = require('./common')

const netlifyConfigPromise = import('@netlify/config')

const NETLIFY_CONFIG_ROOT_DIR = `${__dirname}/../../../config`
const BINARY_PATH = getBinPath({ cwd: NETLIFY_CONFIG_ROOT_DIR })

// Run fixture using `@netlify/config`.
// This is inside `@netlify/build`'s repository since it needs it as well.
const runFixtureConfig = async function (t, fixtureName, { flags = {}, env, ...opts } = {}) {
  const flagsA = {
    stable: true,
    buffer: true,
    branch: 'branch',
    featureFlags: { ...DEFAULT_TEST_FEATURE_FLAGS, ...flags.featureFlags },
    ...flags,
  }
  // Ensure local environment variables aren't used during development
  const envA = { NETLIFY_AUTH_TOKEN: '', ...env }
  return await runFixtureCommon(t, fixtureName, {
    ...opts,
    flags: flagsA,
    env: envA,
    mainFunc,
    binaryPath: await BINARY_PATH,
  })
}

const DEFAULT_TEST_FEATURE_FLAGS = {}

// In tests, make the return value stable so it can be snapshot
const mainFunc = async function (flags) {
  const { resolveConfig } = await netlifyConfigPromise
  const { logs: { stdout = [], stderr = [] } = {}, ...result } = await resolveConfig(flags)
  const resultA = serializeApi(result)
  const resultB = fastSafeStringify.stableStringify(resultA, null, 2)
  const resultC = [stdout.join('\n'), stderr.join('\n'), resultB].filter(Boolean).join('\n\n')
  return resultC
}

const serializeApi = function ({ api, ...result }) {
  if (api === undefined) {
    return result
  }

  return { ...result, hasApi: true }
}

module.exports = { runFixtureConfig }
