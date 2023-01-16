import { fileURLToPath } from 'url'

import { listFrameworks, getFramework as getFrameworkLib, hasFramework as hasFrameworkLib } from '../../src/main.js'

export const FIXTURES_DIR = fileURLToPath(new URL('../fixtures', import.meta.url))

const getOptions = (fixtureName) => ({ projectDir: `${FIXTURES_DIR}/${fixtureName}` })

// Fire the main function with a specific fixture
export const getFrameworks = function (fixtureName) {
  return listFrameworks(getOptions(fixtureName))
}

export const getFramework = function (fixtureName, frameworkId) {
  return getFrameworkLib(frameworkId, getOptions(fixtureName))
}

export const hasFramework = function (fixtureName, frameworkId) {
  return hasFrameworkLib(frameworkId, getOptions(fixtureName))
}
