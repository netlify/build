'use strict'

const { normalize } = require('path')
const process = require('process')

const pathExists = require('path-exists')

// Like `process.cwd()` but safer when current directory is wrong
const safeGetCwd = async function (cwdOpt) {
  try {
    const cwd = getCwdValue(cwdOpt)

    if (!(await pathExists(cwd))) {
      return ''
    }

    return cwd
  } catch (error) {
    return ''
  }
}

const getCwdValue = function (cwdOpt = process.cwd()) {
  return normalize(cwdOpt)
}

module.exports = { safeGetCwd }
