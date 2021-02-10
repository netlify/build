const { listFrameworks, getFramework: getFrameworkLib, hasFramework: hasFrameworkLib } = require('../../src/main.js')

const FIXTURES_DIR = `${__dirname}/../fixtures`

const getOptions = (fixtureName) => ({ projectDir: `${FIXTURES_DIR}/${fixtureName}` })

// Fire the main function with a specific fixture
const getFrameworks = function (fixtureName) {
  return listFrameworks(getOptions(fixtureName))
}

const getFramework = function (fixtureName, frameworkId) {
  return getFrameworkLib(frameworkId, getOptions(fixtureName))
}

const hasFramework = function (fixtureName, frameworkId) {
  return hasFrameworkLib(frameworkId, getOptions(fixtureName))
}

module.exports = { getFrameworks, getFramework, hasFramework, FIXTURES_DIR }
