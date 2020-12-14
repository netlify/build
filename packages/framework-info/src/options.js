const process = require('process')

// Retrieve main options
const getOptions = function ({ projectDir = process.cwd() } = {}) {
  return { projectDir }
}

module.exports = { getOptions }
