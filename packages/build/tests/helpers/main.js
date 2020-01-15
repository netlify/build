require('log-process-errors/build/register/ava')

const {
  env: { PRINT },
} = require('process')
const { normalize } = require('path')
const { tmpdir } = require('os')

const {
  meta: { file: testFile },
} = require('ava')
const execa = require('execa')
const { getBinPath } = require('get-bin-path')
const { magentaBright } = require('chalk')
const del = require('del')
const makeDir = require('make-dir')

const { normalizeOutput } = require('./normalize')

const BINARY_PATH = getBinPath({ cwd: __dirname })
const FIXTURES_DIR = normalize(`${testFile}/../fixtures`)

// Run the netlify-build using a fixture directory, then snapshot the output.
// Options:
//  - `flags` {string[]}: CLI flags
//  - `config` {string}: `--config` CLI flag
//  - `cwd` {string}: current directory when calling `netlify-build`
//  - `env` {object}: environment variable
//  - `normalize` {boolean}: whether to normalize output
//  - `snapshot` {boolean}: whether to create a snapshot
const runFixture = async function(t, fixtureName, { flags = '', config, cwd, env, normalize, snapshot = true } = {}) {
  const envA = {
    NETLIFY_BUILD_SAVE_CACHE: '1',
    TEST_CACHE_PATH: 'none',
    // GitHub actions CI do not have a `master` branch which makes the `git`
    // utility fail
    CACHED_COMMIT_REF: 'HEAD^',
    ...env,
  }
  const configFlag = getConfigFlag(config, fixtureName)
  const binaryPath = await BINARY_PATH
  const { all, exitCode } = await execa.command(`${binaryPath} ${configFlag} ${flags}`, {
    all: true,
    reject: false,
    cwd,
    env: envA,
    timeout: TIMEOUT,
  })

  const isPrint = PRINT === '1'
  doTestAction({ t, all, isPrint, normalize, snapshot })

  return { all, exitCode }
}

// 10 minutes timeout
const TIMEOUT = 6e5

// The `config` flag can be overriden, but defaults to the `netlify.yml` inside
// the fixture directory
const getConfigFlag = function(config, fixtureName) {
  if (config === undefined) {
    return `--config ${FIXTURES_DIR}/${fixtureName}/netlify.yml`
  }

  if (config === false) {
    return ''
  }

  return `--config ${config}`
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
const createRepoDir = async function() {
  const id = String(Math.random()).replace('.', '')
  const cwd = `${tmpdir()}/netlify-build-${id}`

  await makeDir(cwd)
  await execa.command('git init', { cwd })
  await execa.command('git config user.email test@test.com', { cwd })
  await execa.command('git config user.name test', { cwd })
  await addGitCommit(cwd)
  await addGitCommit(cwd)

  return cwd
}

const addGitCommit = async function(cwd) {
  await execa.command('git commit --allow-empty -m test', { cwd })
}

module.exports = { runFixture, FIXTURES_DIR, removeDir, createRepoDir }
