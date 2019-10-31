require('log-process-errors/build/register/ava')

const {
  env: { PRINT },
} = require('process')

const execa = require('execa')
const { getBinPath } = require('get-bin-path')
const chalk = require('chalk')

const { normalizeOutput } = require('./normalize')

const BINARY_PATH = getBinPath({ cwd: __dirname })
const FIXTURES_DIR = `${__dirname}/../fixtures`

// Run the netlify-build using a fixture directory, then snapshot the output.
// CLI `flags` can be specified.
// The `config` can be overriden.
// Specific `execaOptions` can be specified.
const runFixture = async function(t, fixtureName, { flags = '', config, ...execaOptions } = {}) {
  const configFlag = getConfigFlag(config, fixtureName)
  const binaryPath = await BINARY_PATH
  const { all, exitCode } = await execa.command(`${binaryPath} ${configFlag} ${flags}`, {
    all: true,
    reject: false,
    ...execaOptions,
  })

  doTestAction(t, all)

  return { all, exitCode }
}

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
const doTestAction = function(t, all) {
  if (PRINT !== '1') {
    t.snapshot(normalizeOutput(all))
    return
  }

  console.log(`
${chalk.magentaBright.bold(`${LINE}
  ${t.title}
${LINE}`)}

${all}`)
  t.pass()
}

const LINE = '='.repeat(40)

module.exports = { runFixture, FIXTURES_DIR }
