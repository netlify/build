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
const chalk = require('chalk')

const { normalizeOutput } = require('./normalize')

const BINARY_PATH = getBinPath({ cwd: __dirname })
const FIXTURES_DIR = normalize(`${testFile}/../fixtures`)

// Run the netlify-build using a fixture directory, then snapshot the output.
// Options:
//  - `flags` {string[]}: CLI flags
//  - `config` {string}: `--config` CLI flag
//  - `cwd` {string}: current directory when calling `netlify-build`
//  - `env` {object}: environment variable
const runFixture = async function(t, fixtureName, { flags = '', config, cwd, env, debug = false } = {}) {
  const configFlag = getConfigFlag(config, fixtureName)
  const binaryPath = await BINARY_PATH
  const { all, exitCode } = await execa.command(`${binaryPath} ${configFlag} ${flags}`, {
    all: true,
    reject: false,
    cwd,
    env,
    timeout: TIMEOUT,
  })

  doTestAction({ t, all, debug })

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
const doTestAction = function({ t, all, debug }) {
  if (PRINT === '1') {
    return printOutput(t, all)
  }

  if (debug) {
    return t.snapshot(all)
  }

  t.snapshot(normalizeOutput(all))
}

const printOutput = function(t, all) {
  console.log(`
${chalk.magentaBright.bold(`${LINE}
  ${t.title}
${LINE}`)}

${all}`)
  t.pass()
}

const LINE = '='.repeat(40)

module.exports = { runFixture, FIXTURES_DIR }
