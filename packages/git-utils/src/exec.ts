import process from 'process'
import { existsSync } from 'fs'
import { execaSync } from 'execa'
import moize from 'moize/mjs/index.mjs'

// Fires the `git` binary. Memoized.
const mGit = function (args, cwd) {
  const cwdA = safeGetCwd(cwd)
  try {
    const { stdout } = execaSync('git', args, { cwd: cwdA })
    return stdout
  } catch (error) {
    // The child process `error.message` includes stderr and stdout output which most of the time contains duplicate
    // information. We rely on `error.shortMessage` instead.
    error.message = error.shortMessage
    throw error
  }
}

export const git = moize(mGit, { isDeepEqual: true, maxSize: 1e3 })

const safeGetCwd = function (cwd) {
  const cwdA = getCwdValue(cwd)

  if (!existsSync(cwdA)) {
    throw new Error(`Current directory does not exist: ${cwdA}`)
  }

  return cwdA
}

const getCwdValue = function (cwd) {
  if (cwd !== undefined) {
    return cwd
  }

  try {
    return process.cwd()
  } catch {
    throw new Error('Current directory does not exist')
  }
}
