const { listFrameworks, getFramework: getFrameworkLib } = require('../../src/main.js')

const FIXTURES_DIR = `${__dirname}/../fixtures`

// Fire the main function with a specific fixture
const getFrameworks = function(fixtureName, opts = {}) {
  return listFrameworks({ projectDir: `${FIXTURES_DIR}/${fixtureName}`, ...opts })
}

const getFramework = function(fixtureName, frameworkName, opts = {}) {
  return getFrameworkLib(frameworkName, { projectDir: `${FIXTURES_DIR}/${fixtureName}`, ...opts })
}

module.exports = { getFrameworks, getFramework, FIXTURES_DIR }
