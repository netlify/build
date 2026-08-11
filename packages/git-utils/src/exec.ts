import process from 'process'
import { existsSync } from 'fs'
import { memoize } from 'micro-memoize'
import { xSync } from 'tinyexec'

const MAX_BUFFER = 1e8 // 100MB

// Fires the `git` binary. Memoized.
const mGit = function (args, cwd) {
  const cwdA = safeGetCwd(cwd)
  const { stdout } = xSync('git', args, { throwOnError: true, nodeOptions: { cwd: cwdA, maxBuffer: MAX_BUFFER } })
  // Callers split the output on newlines, so the trailing newline must be stripped
  return stdout.replace(/\n$/, '')
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
