const { getBinPath } = require('get-bin-path')

// Tests require the full monorepo to be present at the moment
// TODO: split tests utility into its own package
const {
  runFixtureCommon,
  FIXTURES_DIR,
  getJsonOpt,
  escapeExecaOpt,
  startServer,
} = require('../../../build/tests/helpers/common')

const ROOT_DIR = `${__dirname}/../..`

const runFixture = async function(t, fixtureName, { env, ...opts } = {}) {
  return runFixtureCommon(t, fixtureName, {
    ...opts,
    binaryPath: await BINARY_PATH,
    env: {
      // Ensure local tokens aren't used during development
      NETLIFY_AUTH_TOKEN: '',
      // Make snapshot consistent regardless of the actual current git branch
      BRANCH: 'branch',
      ...env,
    },
  })
}
const BINARY_PATH = getBinPath({ cwd: ROOT_DIR })

module.exports = { runFixture, FIXTURES_DIR, getJsonOpt, escapeExecaOpt, startServer }
