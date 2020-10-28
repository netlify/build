const { listFrameworks, getFramework: getFrameworkLib, hasFramework: hasFrameworkLib } = require('../../src/main.js')

const FIXTURES_DIR = `${__dirname}/../fixtures`

// Fire the main function with a specific fixture
const getFrameworks = function(fixtureName, opts = {}) {
  return listFrameworks({ projectDir: `${FIXTURES_DIR}/${fixtureName}`, ...opts })
}

const getFramework = function(fixtureName, frameworkName, opts = {}) {
  return getFrameworkLib(frameworkName, { projectDir: `${FIXTURES_DIR}/${fixtureName}`, ...opts })
}

const hasFramework = function(fixtureName, frameworkName, opts = {}) {
  return hasFrameworkLib(frameworkName, { projectDir: `${FIXTURES_DIR}/${fixtureName}`, ...opts })
}

module.exports = { getFrameworks, getFramework, hasFramework, FIXTURES_DIR }
