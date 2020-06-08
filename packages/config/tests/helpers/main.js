const { getBinPath } = require('get-bin-path')

// Tests require the full monorepo to be present at the moment
// TODO: split tests utility into its own package
const { runFixtureCommon, FIXTURES_DIR, escapeExecaOpt, startServer } = require('../../../build/tests/helpers/common')

const ROOT_DIR = `${__dirname}/../..`

const runFixture = async function(t, fixtureName, { env, flags = {}, ...opts } = {}) {
  return runFixtureCommon(t, fixtureName, {
    ...opts,
    binaryPath: await BINARY_PATH,
    // Ensure local tokens aren't used during development
    env: { NETLIFY_AUTH_TOKEN: '', ...env },
    flags: { branch: 'branch', stable: true, ...flags },
  })
}
const BINARY_PATH = getBinPath({ cwd: ROOT_DIR })

module.exports = { runFixture, FIXTURES_DIR, escapeExecaOpt, startServer }
