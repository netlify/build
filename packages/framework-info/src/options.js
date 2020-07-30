const process = require('process')

// Retrieve main options
const getOptions = function({ projectDir = process.cwd(), ignoredWatchCommand } = {}) {
  return { projectDir, ignoredWatchCommand }
}

module.exports = { getOptions }
