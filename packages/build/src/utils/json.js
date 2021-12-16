'use strict'

const { promises: fs, readFileSync } = require('fs')

const ROOT_PACKAGE_JSON_PATH = `${__dirname}/../../package.json`

// TODO: Replace with dynamic `import()` once it is supported without
// experimental flags
const importJsonFile = async function (filePath) {
  const fileContents = await fs.readFile(filePath, 'utf8')
  return JSON.parse(fileContents)
}

const importJsonFileSync = function (filePath) {
  // Use sync I/O so it is easier to migrate to `import()` later on
  const fileContents = readFileSync(filePath, 'utf8')
  return JSON.parse(fileContents)
}

const ROOT_PACKAGE_JSON = importJsonFileSync(ROOT_PACKAGE_JSON_PATH)

module.exports = { importJsonFile, ROOT_PACKAGE_JSON }
