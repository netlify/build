import process from 'process'
import { existsSync } from 'fs'
import { memoize } from 'micro-memoize'
import { NonZeroExitError, xSync } from 'tinyexec'

const MAX_BUFFER = 1e8 // 100MB

// Command failure with the `stderr` included in the message, so it is human readable
// when surfaced to users regardless of how the error is printed
export class GitError extends Error {
  constructor(error: NonZeroExitError) {
    const stderr = error.output?.stderr.trim()
    super(stderr ? `${error.message}\n${stderr}` : error.message)
    this.name = 'GitError'
  }
}

// Fires the `git` binary. Memoized.
const mGit = function (args, cwd) {
  const cwdA = safeGetCwd(cwd)
  try {
    const { stdout } = xSync('git', args, { throwOnError: true, nodeOptions: { cwd: cwdA, maxBuffer: MAX_BUFFER } })
    // Callers split the output on newlines, so the trailing newline must be stripped
    return stdout.replace(/\n$/, '')
  } catch (error) {
    throw error instanceof NonZeroExitError ? new GitError(error) : error
  }
}

export const git = memoize(mGit, { isKeyItemEqual: 'deep', maxSize: 1e3 })

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
