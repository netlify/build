const { getBinPath } = require('get-bin-path')

// Tests require the full monorepo to be present at the moment
// TODO: split tests utility into its own package
const { runFixtureCommon, FIXTURES_DIR, escapeExecaOpt, startServer } = require('../../../build/tests/helpers/common')

const ROOT_DIR = `${__dirname}/../..`

const runFixture = async function(t, fixtureName, { flags = {}, env, ...opts } = {}) {
  const binaryPath = await BINARY_PATH
  const flagsA = { stable: true, branch: 'branch', ...flags }
  // Ensure local environment variables aren't used during development
  const envA = { NETLIFY_AUTH_TOKEN: '', ...env }
  return runFixtureCommon(t, fixtureName, { ...opts, flags: flagsA, env: envA, binaryPath })
}

// Use a top-level promise so it's only performed once at load time
const BINARY_PATH = getBinPath({ cwd: ROOT_DIR })

module.exports = { runFixture, FIXTURES_DIR, escapeExecaOpt, startServer }
