require('log-process-errors/build/register/ava')

const {
  env: { PRINT },
} = require('process')
const { normalize } = require('path')

const {
  meta: { file: testFile },
} = require('ava')
const execa = require('execa')
const { getBinPath } = require('get-bin-path')
const { magentaBright } = require('chalk')

const PROJECTS_DIR = `${__dirname}/../../..`

const { normalizeOutput } = require('./normalize')

const FIXTURES_DIR = normalize(`${testFile}/../fixtures`)

// Run the @netlify/build CLI using a fixture directory, then snapshot the output.
// Options:
//  - `flags` {string[]}: CLI flags
//  - `repositoryRoot` {string}: `--repositoryRoot` CLI flag
//  - `env` {object}: environment variable
//  - `normalize` {boolean}: whether to normalize output
//  - `snapshot` {boolean}: whether to create a snapshot
const runFixture = async function(
  t,
  fixtureName,
  {
    type = 'build',
    flags = '',
    env,
    normalize,
    snapshot = true,
    repositoryRoot = `${FIXTURES_DIR}/${fixtureName}`,
  } = {},
) {
  const envA = { ...DEFAULT_ENV[type], ...env }
  const repositoryRootFlag = getRepositoryRootFlag(fixtureName, repositoryRoot)
  const binaryPath = await BINARY_PATH[type]
  const { all, exitCode } = await execa.command(`${binaryPath} ${repositoryRootFlag} ${flags}`, {
    all: true,
    reject: false,
    env: envA,
    timeout: TIMEOUT,
  })

  const isPrint = PRINT === '1'
  doTestAction({ t, type, all, isPrint, normalize, snapshot })

  return { all, exitCode }
}

// Same with @netlify/config
const runFixtureConfig = function(t, fixtureName, opts) {
  return runFixture(t, fixtureName, { ...opts, type: 'config' })
}

// Each project has its own binary entry point
const BUILD_BINARY_PATH = getBinPath({ cwd: `${PROJECTS_DIR}/build` })
const CONFIG_BINARY_PATH = getBinPath({ cwd: `${PROJECTS_DIR}/config` })
const BINARY_PATH = {
  build: BUILD_BINARY_PATH,
  config: CONFIG_BINARY_PATH,
}

// Each project has its own set of default environment variables
const DEFAULT_ENV = {
  build: {
    // Workarounds to mock caching logic
    NETLIFY_BUILD_SAVE_CACHE: '1',
    TEST_CACHE_PATH: 'none',
    // Ensure local tokens aren't used during development
    NETLIFY_AUTH_TOKEN: '',
  },
  config: {
    // Make snapshot consistent regardless of the actual current git branch
    BRANCH: 'branch',
  },
}

// 10 minutes timeout
const TIMEOUT = 6e5

// The `repositoryRoot` flag can be overriden, but defaults to the fixture
// directory
const getRepositoryRootFlag = function(fixtureName, repositoryRoot) {
  if (fixtureName === '') {
    return ''
  }

  return `--repositoryRoot=${normalize(repositoryRoot)}`
}

// The `PRINT` environment variable can be set to `1` to run the test in print
// mode. Print mode is a debugging mode which shows the test output but does
// not create nor compare its snapshot.
const doTestAction = function({ t, type, all, isPrint, normalize = !isPrint, snapshot }) {
  const allA = normalize ? normalizeOutput(all, type) : all

  if (isPrint) {
    return printOutput(t, allA)
  }

  if (!snapshot) {
    return
  }

  if (shouldIgnoreSnapshot(allA)) {
    t.pass()
    return
  }

  t.snapshot(allA)
}

const printOutput = function(t, all) {
  console.log(`
${magentaBright.bold(`${LINE}
  ${t.title}
${LINE}`)}

${all}`)
  t.pass()
}

const LINE = '='.repeat(50)

const shouldIgnoreSnapshot = function(all) {
  return IGNORE_REGEXPS.some(regExp => regExp.test(all))
}

const IGNORE_REGEXPS = [
  // Some tests run npm|yarn, which sometimes fail due to network errors
  /getaddrinfo EAI_AGAIN/,
  /npm ERR!/,
]

module.exports = { runFixture, runFixtureConfig, FIXTURES_DIR }
