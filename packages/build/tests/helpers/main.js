require('log-process-errors/build/register/ava')

const {
  env,
  env: { PRINT },
} = require('process')
const { normalize, delimiter } = require('path')

const {
  meta: { file: testFile },
} = require('ava')
const execa = require('execa')
const { getBinPath } = require('get-bin-path')
const { magentaBright } = require('chalk')
const pathKey = require('path-key')
const cpy = require('cpy')

const PROJECTS_DIR = `${__dirname}/../../..`
const BUILD_BIN_DIR = `${PROJECTS_DIR}/build/node_modules/.bin`

const { normalizeOutput } = require('./normalize')
const { createRepoDir, removeDir } = require('./dir')

const FIXTURES_DIR = normalize(`${testFile}/../fixtures`)

// Run the @netlify/build CLI using a fixture directory, then snapshot the output.
// Options:
//  - `flags` {string[]}: CLI flags
//  - `repositoryRoot` {string}: `--repositoryRoot` CLI flag
//  - `env` {object}: environment variable
//  - `normalize` {boolean}: whether to normalize output
//  - `snapshot` {boolean}: whether to create a snapshot
//  - `copyRoot` {object}: copy the fixture directory to a temporary directory
//    This is useful so that no parent has a `.git` or `package.json`.
//  - `copyRoot.git` {boolean}: whether the copied directory should have a `.git`
//    Default: true
//  - `copyRoot.branch` {string}: create a git branch after copy
const runFixture = async function(
  t,
  fixtureName,
  {
    type = 'build',
    flags = '',
    env: envOption,
    normalize,
    snapshot = true,
    repositoryRoot = `${FIXTURES_DIR}/${fixtureName}`,
    copyRoot,
  } = {},
) {
  const isPrint = PRINT === '1'
  const FORCE_COLOR = isPrint ? '1' : ''
  const commandEnv = { ...DEFAULT_ENV[type], FORCE_COLOR, ...envOption }
  const copyRootDir = await getCopyRootDir({ copyRoot })
  const repositoryRootFlag = getRepositoryRootFlag({ fixtureName, copyRootDir, repositoryRoot })
  const binaryPath = await BINARY_PATH[type]
  const { stdout, stderr, all, exitCode } = await runCommand({
    binaryPath,
    repositoryRootFlag,
    flags,
    isPrint,
    snapshot,
    commandEnv,
    fixtureName,
    copyRoot,
    copyRootDir,
  })

  doTestAction({ t, type, stdout, stderr, all, isPrint, normalize, snapshot })

  return { stdout, stderr, exitCode }
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
    NETLIFY_BUILD_DEBUG: '1',
    // Workarounds to mock caching logic
    NETLIFY_BUILD_SAVE_CACHE: '1',
    TEST_CACHE_PATH: 'none',
    // Ensure local tokens aren't used during development
    NETLIFY_AUTH_TOKEN: '',
    // Allows executing any locally installed Node modules inside tests,
    // regardless of the current directory
    [pathKey()]: `${env[pathKey()]}${delimiter}${BUILD_BIN_DIR}`,
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
const getRepositoryRootFlag = function({ fixtureName, copyRootDir, repositoryRoot }) {
  if (fixtureName === '') {
    return ''
  }

  if (copyRootDir !== undefined) {
    return `--repositoryRoot=${normalize(copyRootDir)}`
  }

  return `--repositoryRoot=${normalize(repositoryRoot)}`
}

const getCopyRootDir = function({ copyRoot, copyRoot: { git } = {} }) {
  if (copyRoot === undefined) {
    return
  }

  return createRepoDir({ git })
}

const runCommand = async function({
  binaryPath,
  repositoryRootFlag,
  flags,
  isPrint,
  snapshot,
  commandEnv,
  fixtureName,
  copyRoot,
  copyRoot: { branch } = {},
  copyRootDir,
}) {
  if (copyRoot === undefined) {
    return execCommand({ binaryPath, repositoryRootFlag, flags, isPrint, snapshot, commandEnv })
  }

  try {
    await cpy('**', copyRootDir, { cwd: `${FIXTURES_DIR}/${fixtureName}`, parents: true })

    if (branch !== undefined) {
      await execa.command(`git checkout -b ${branch}`, { cwd: copyRootDir })
    }

    return await execCommand({ binaryPath, repositoryRootFlag, flags, isPrint, snapshot, commandEnv })
  } finally {
    await removeDir(copyRootDir)
  }
}

const execCommand = function({ binaryPath, repositoryRootFlag, flags, isPrint, snapshot, commandEnv }) {
  return execa.command(`${binaryPath} ${repositoryRootFlag} ${flags}`, {
    all: isPrint && snapshot,
    reject: false,
    env: commandEnv,
    timeout: TIMEOUT,
  })
}

// The `PRINT` environment variable can be set to `1` to run the test in print
// mode. Print mode is a debugging mode which shows the test output but does
// not create nor compare its snapshot.
const doTestAction = function({ t, type, stdout, stderr, all, isPrint, normalize = !isPrint, snapshot }) {
  if (!snapshot) {
    return
  }

  if (isPrint) {
    const allA = normalizeOutputString(all, type, normalize)
    return printOutput(t, allA)
  }

  const stdoutA = normalizeOutputString(stdout, type, normalize)
  const stderrA = normalizeOutputString(stderr, type, normalize)
  // stdout and stderr can be intertwined in a time-sensitive / race-condition
  // manner otherwise
  const allB = [stdoutA, stderrA].filter(Boolean).join('\n\n')

  if (shouldIgnoreSnapshot(allB)) {
    t.pass()
    return
  }

  t.snapshot(allB)
}

const normalizeOutputString = function(outputString, type, normalize) {
  if (!normalize) {
    return outputString
  }

  return normalizeOutput(outputString, type)
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
  // Some tests send network requests, which can sometimes fail
  /getaddrinfo EAI_AGAIN/,
]

// Get an CLI flag whose value is a JSON object, to be passed to `execa.command()`
// Used for example by --defaultConfig and --cachedConfig.
const getJsonOpt = function(object) {
  return escapeExecaOpt(JSON.stringify(object))
}

// Escape CLI flag value that might contain a space
const escapeExecaOpt = function(string) {
  return string.replace(EXECA_COMMAND_REGEXP, '\\ ')
}

const EXECA_COMMAND_REGEXP = / /g

module.exports = { runFixture, runFixtureConfig, FIXTURES_DIR, getJsonOpt, escapeExecaOpt }
