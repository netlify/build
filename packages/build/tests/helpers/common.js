require('log-process-errors/build/register/ava')

const { normalize } = require('path')
const { env } = require('process')

const {
  meta: { file: testFile },
} = require('ava')
const { magentaBright } = require('chalk')
const cpy = require('cpy')
const execa = require('execa')

const { createRepoDir, removeDir } = require('./dir')
const { normalizeOutput } = require('./normalize')
const { startServer } = require('./server')

const FIXTURES_DIR = normalize(`${testFile}/../fixtures`)

// Run a CLI using a fixture directory, then snapshot the output.
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
const runFixtureCommon = async function(
  t,
  fixtureName,
  {
    flags = '',
    env: envOption,
    normalize = !isPrint(),
    snapshot = true,
    repositoryRoot = `${FIXTURES_DIR}/${fixtureName}`,
    copyRoot,
    binaryPath,
  } = {},
) {
  const commandEnv = { NETLIFY_BUILD_TEST: '1', ...envOption }
  const copyRootDir = await getCopyRootDir({ copyRoot })
  const mainFlags = getMainFlags({ fixtureName, copyRoot, copyRootDir, repositoryRoot, flags })
  const { stdout, stderr, all, failed } = await runCommand({
    binaryPath,
    mainFlags,
    snapshot,
    commandEnv,
    fixtureName,
    copyRoot,
    copyRootDir,
  })

  doTestAction({ t, stdout, stderr, all, normalize, snapshot })

  return { stdout, stderr, failed }
}

// Retrieve flags to the main entry point
const getMainFlags = function({ fixtureName, copyRoot, copyRootDir, repositoryRoot, flags }) {
  const repositoryRootFlag = getRepositoryRootFlag({ fixtureName, copyRoot, copyRootDir, repositoryRoot })
  return `${DEFAULT_FLAGS} ${repositoryRootFlag} ${flags}`
}

const DEFAULT_FLAGS = '--debug'

// The `repositoryRoot` flag can be overriden, but defaults to the fixture
// directory
const getRepositoryRootFlag = function({ fixtureName, copyRoot: { cwd } = {}, copyRootDir, repositoryRoot }) {
  if (fixtureName === '') {
    return ''
  }

  if (copyRootDir === undefined) {
    return `--repositoryRoot=${normalize(repositoryRoot)}`
  }

  if (cwd) {
    return `--cwd=${normalize(copyRootDir)}`
  }

  return `--repositoryRoot=${normalize(copyRootDir)}`
}

const getCopyRootDir = function({ copyRoot, copyRoot: { git } = {} }) {
  if (copyRoot === undefined) {
    return
  }

  return createRepoDir({ git })
}

const runCommand = async function({
  binaryPath,
  mainFlags,
  snapshot,
  commandEnv,
  fixtureName,
  copyRoot,
  copyRoot: { branch } = {},
  copyRootDir,
}) {
  if (copyRoot === undefined) {
    return execCommand({ binaryPath, mainFlags, snapshot, commandEnv })
  }

  try {
    await cpy('**', copyRootDir, { cwd: `${FIXTURES_DIR}/${fixtureName}`, parents: true })

    if (branch !== undefined) {
      await execa.command(`git checkout -b ${branch}`, { cwd: copyRootDir })
    }

    return await execCommand({ binaryPath, mainFlags, snapshot, commandEnv })
  } finally {
    await removeDir(copyRootDir)
  }
}

const execCommand = function({ binaryPath, mainFlags, snapshot, commandEnv }) {
  return execa.command(`${binaryPath} ${mainFlags}`, {
    all: isPrint() && snapshot,
    reject: false,
    env: commandEnv,
  })
}

// The `PRINT` environment variable can be set to `1` to run the test in print
// mode. Print mode is a debugging mode which shows the test output but does
// not create nor compare its snapshot.
const doTestAction = function({ t, stdout, stderr, all, normalize, snapshot }) {
  if (!snapshot) {
    return
  }

  if (isPrint()) {
    const allA = normalizeOutputString(all, normalize)
    return printOutput(t, allA)
  }

  const stdoutA = normalizeOutputString(stdout, normalize)
  const stderrA = normalizeOutputString(stderr, normalize)
  // stdout and stderr can be intertwined in a time-sensitive / race-condition
  // manner otherwise
  const allB = [stdoutA, stderrA].filter(Boolean).join('\n\n')

  if (shouldIgnoreSnapshot(allB)) {
    t.pass()
    return
  }

  t.snapshot(allB)
}

const normalizeOutputString = function(outputString, normalize) {
  if (!normalize) {
    return outputString
  }

  return normalizeOutput(outputString)
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

// When running tests with PRINT=1, print the results instead of snapshotting
const isPrint = function() {
  return env.PRINT === '1'
}

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

module.exports = { runFixtureCommon, FIXTURES_DIR, getJsonOpt, escapeExecaOpt, startServer }
