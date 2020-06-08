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
  const { returnValue, failed } = await runCommand({
    binaryPath,
    mainFlags,
    commandEnv,
    fixtureName,
    copyRoot,
    copyRootDir,
  })

  doTestAction({ t, returnValue, normalize, snapshot })

  return { returnValue, failed }
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
  commandEnv,
  fixtureName,
  copyRoot,
  copyRoot: { branch } = {},
  copyRootDir,
}) {
  if (copyRoot === undefined) {
    return execCommand({ binaryPath, mainFlags, commandEnv })
  }

  try {
    await cpy('**', copyRootDir, { cwd: `${FIXTURES_DIR}/${fixtureName}`, parents: true })

    if (branch !== undefined) {
      await execa.command(`git checkout -b ${branch}`, { cwd: copyRootDir })
    }

    return await execCommand({ binaryPath, mainFlags, commandEnv })
  } finally {
    await removeDir(copyRootDir)
  }
}

const execCommand = async function({ binaryPath, mainFlags, commandEnv }) {
  const { all, failed } = await execa.command(`${binaryPath} ${mainFlags}`, {
    all: true,
    reject: false,
    env: commandEnv,
  })
  return { returnValue: all, failed }
}

// The `PRINT` environment variable can be set to `1` to run the test in print
// mode. Print mode is a debugging mode which shows the test output but does
// not create nor compare its snapshot.
const doTestAction = function({ t, returnValue, normalize, snapshot }) {
  if (!snapshot) {
    return
  }

  const normalizedReturn = normalizeOutputString(returnValue, normalize)

  if (isPrint()) {
    return printOutput(t, normalizedReturn)
  }

  if (shouldIgnoreSnapshot(normalizedReturn)) {
    t.pass()
    return
  }

  t.snapshot(normalizedReturn)
}

const normalizeOutputString = function(outputString, normalize) {
  if (!normalize) {
    return outputString
  }

  return normalizeOutput(outputString)
}

const printOutput = function(t, normalizedReturn) {
  console.log(`
${magentaBright.bold(`${LINE}
  ${t.title}
${LINE}`)}

${normalizedReturn}`)
  t.pass()
}

const LINE = '='.repeat(50)

const shouldIgnoreSnapshot = function(normalizedReturn) {
  return IGNORE_REGEXPS.some(regExp => regExp.test(normalizedReturn))
}

const IGNORE_REGEXPS = [
  // Some tests send network requests, which can sometimes fail
  /getaddrinfo EAI_AGAIN/,
]

// When running tests with PRINT=1, print the results instead of snapshotting
const isPrint = function() {
  return env.PRINT === '1'
}

// Escape CLI flag value that might contain a space
const escapeExecaOpt = function(string) {
  return string.replace(EXECA_COMMAND_REGEXP, '\\ ')
}

const EXECA_COMMAND_REGEXP = / /g

module.exports = { runFixtureCommon, FIXTURES_DIR, escapeExecaOpt, startServer }
