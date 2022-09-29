import { delimiter, normalize } from 'path'
import { env } from 'process'
import { fileURLToPath } from 'url'

import { getBinPath } from 'get-bin-path'
import pathKey from 'path-key'

import netlifyBuild, { runCoreSteps, startDev } from '../../lib/core/main.js'

import { runFixtureCommon } from './common.js'

const ROOT_DIR = fileURLToPath(new URL('../..', import.meta.url))
const BUILD_BIN_DIR = normalize(`${ROOT_DIR}/node_modules/.bin`)

export const runFixture = async function (
  t,
  fixtureName,
  { flags = {}, env: envOption = {}, programmatic = false, devCommand, ...opts } = {},
) {
  const binaryPath = await BINARY_PATH
  const flagsA = {
    debug: true,
    buffer: true,
    featureFlags: { ...DEFAULT_TEST_FEATURE_FLAGS, ...flags.featureFlags },
    ...flags,
    testOpts: { silentLingeringProcesses: true, pluginsListUrl: 'test', ...flags.testOpts },
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
  const entryPoint = flagsA.timeline === 'dev' ? startDev.bind(null, devCommand) : netlifyBuild
  const mainFunc = programmatic ? entryPoint : getNetlifyBuildLogs.bind(null, entryPoint)
  return runFixtureCommon(t, fixtureName, {
    ...opts,
    flags: flagsA,
    env: envOptionA,
    mainFunc,
    binaryPath,
    runCoreStepsFunc: runCoreSteps,
  })
}

const DEFAULT_TEST_FEATURE_FLAGS = {}

const getNetlifyBuildLogs = async function (entryPoint, flags) {
  const { logs } = await entryPoint(flags)
  return [logs.stdout.join('\n'), logs.stderr.join('\n')].filter(Boolean).join('\n\n')
}

// Use a top-level promise so it's only performed once at load time
const BINARY_PATH = getBinPath({ cwd: ROOT_DIR })
