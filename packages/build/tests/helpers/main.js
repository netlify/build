require('log-process-errors/build/register/ava')

const {
  env: { PRINT },
} = require('process')
const { normalize, basename } = require('path')
const { tmpdir } = require('os')
const { realpath } = require('fs')
const { promisify } = require('util')

const {
  meta: { file: testFile },
} = require('ava')
const execa = require('execa')
const { getBinPath } = require('get-bin-path')
const { magentaBright } = require('chalk')
const del = require('del')
const makeDir = require('make-dir')
const cpFile = require('cp-file')

const { normalizeOutput } = require('./normalize')

const BINARY_PATH = getBinPath({ cwd: __dirname })
const FIXTURES_DIR = normalize(`${testFile}/../fixtures`)

const pRealpath = promisify(realpath)

// Run the netlify-build using a fixture directory, then snapshot the output.
// Options:
//  - `flags` {string[]}: CLI flags
//  - `repositoryRoot` {string}: `--repositoryRoot` CLI flag
//  - `env` {object}: environment variable
//  - `normalize` {boolean}: whether to normalize output
//  - `snapshot` {boolean}: whether to create a snapshot
const runFixture = async function(
  t,
  fixtureName,
  { flags = '', env, normalize, snapshot = true, repositoryRoot = `${FIXTURES_DIR}/${fixtureName}` } = {},
) {
  const envA = {
    // Workarounds to mock caching logic
    NETLIFY_BUILD_SAVE_CACHE: '1',
    TEST_CACHE_PATH: 'none',
    // Ensure local tokens aren't used during development
    NETLIFY_AUTH_TOKEN: '',
    ...env,
  }
  const repositoryRootFlag = getRepositoryRootFlag(fixtureName, repositoryRoot)
  const binaryPath = await BINARY_PATH
  const { all, exitCode } = await execa.command(`${binaryPath} ${repositoryRootFlag} ${flags}`, {
    all: true,
    reject: false,
    env: envA,
    timeout: TIMEOUT,
  })

  const isPrint = PRINT === '1'
  doTestAction({ t, all, isPrint, normalize, snapshot })

  return { all, exitCode }
}

// 10 minutes timeout
const TIMEOUT = 6e5

// The `repositoryRoot` flag can be overriden, but defaults to the fixture
// directory
const getRepositoryRootFlag = function(fixtureName, repositoryRoot) {
  if (fixtureName === '') {
    return ''
  }

  return `--repositoryRoot=${repositoryRoot}`
}

// The `PRINT` environment variable can be set to `1` to run the test in print
// mode. Print mode is a debugging mode which shows the test output but does
// not create nor compare its snapshot.
const doTestAction = function({ t, all, isPrint, normalize = !isPrint, snapshot }) {
  const allA = normalize ? normalizeOutput(all) : all

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

// Removing a directory sometimes fails on Windows in CI due to Windows
// directory locking.
// This results in `EBUSY: resource busy or locked, rmdir /path/to/dir`
const removeDir = async function(dir) {
  try {
    await del(dir, { force: true })
    // eslint-disable-next-line no-empty
  } catch (error) {}
}

// Create a temporary directory with a `.git` directory, which can be used as
// the current directory of a build. Otherwise the `git` utility does not load.
const createRepoDir = async function({ git = true } = {}) {
  const cwd = await getTempDir()
  await createGit(cwd, git)
  return cwd
}

const createGit = async function(cwd, git) {
  if (!git) {
    return
  }

  await execa.command('git init', { cwd })
  await execa.command('git config user.email test@test.com', { cwd })
  await execa.command('git config user.name test', { cwd })
  await execa.command('git commit --allow-empty -m one', { cwd })
  await execa.command('git config --unset user.email', { cwd })
  await execa.command('git config --unset user.name', { cwd })
}

// Copy a file to a temporary one
const copyToTemp = async function(path) {
  const filename = basename(path)
  const tempDir = await getTempDir()
  const tempFile = normalize(`${tempDir}/${filename}`)
  await cpFile(path, tempFile)
  return { tempDir, tempFile }
}

// Create and retrieve a new temporary sub-directory
const getTempDir = async function() {
  const id = String(Math.random()).replace('.', '')
  const tempDir = normalize(`${tmpdir()}/netlify-build-${id}`)
  await makeDir(tempDir)
  const tempDirA = await pRealpath(tempDir)
  return tempDirA
}

module.exports = { runFixture, FIXTURES_DIR, removeDir, createRepoDir, copyToTemp }
