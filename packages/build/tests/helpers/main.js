const { getBinPath } = require('get-bin-path')

const { runFixtureCommon, FIXTURES_DIR } = require('./common')

const ROOT_DIR = `${__dirname}/../..`

const runFixture = async function(t, fixtureName, { flags = {}, env = {}, ...opts } = {}) {
  const binaryPath = await BINARY_PATH
  const flagsA = { telemetry: false, buffer: true, ...flags }
  // Ensure local environment variables aren't used during development
  const envA = { BUILD_TELEMETRY_DISABLED: '', NETLIFY_AUTH_TOKEN: '', ...env }
  return runFixtureCommon(t, fixtureName, { ...opts, flags: flagsA, env: envA, binaryPath })
}

// Use a top-level promise so it's only performed once at load time
const BINARY_PATH = getBinPath({ cwd: ROOT_DIR })

module.exports = { runFixture, FIXTURES_DIR }
