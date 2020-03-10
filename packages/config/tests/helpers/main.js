// Tests require the full monorepo to be present at the moment
// TODO: split tests utility into its own package
const { runFixtureConfig, FIXTURES_DIR } = require('../../../build/tests/helpers/main')
const { createRepoDir, removeDir } = require('../../../build/tests/helpers/dir')

module.exports = { runFixtureConfig, FIXTURES_DIR, createRepoDir, removeDir }
