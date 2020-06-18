const process = require('process')

const execa = require('execa')
const moize = require('moize').default
const pathExists = require('path-exists')

// Fires the `git` binary. Memoized.
const mGit = function(args, cwd) {
  const cwdA = safeGetCwd(cwd)
  const { stdout } = execa.sync('git', args, { cwd: cwdA })
  return stdout
}

const git = moize(mGit, { isDeepEqual: true })

const safeGetCwd = function(cwd) {
  const cwdA = getCwdValue(cwd)

  if (!pathExists.sync(cwdA)) {
    throw new Error(`Current directory does not exist: ${cwdA}`)
  }

  return cwdA
}

const getCwdValue = function(cwd) {
  if (cwd !== undefined) {
    return cwd
  }

  try {
    return process.cwd()
  } catch (error) {
    throw new Error('Current directory does not exist')
  }
}

module.exports = { git }
