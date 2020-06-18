const process = require('process')

const pathExists = require('path-exists')

// Like `process.cwd()` but safer when current directory is wrong
const safeGetCwd = async function() {
  try {
    const cwd = process.cwd()

    if (!(await pathExists(cwd))) {
      return ''
    }

    return cwd
  } catch (error) {
    return ''
  }
}

module.exports = { safeGetCwd }
