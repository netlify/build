import { normalize } from 'path'
import { existsSync } from 'fs'
import process from 'process'

// Like `process.cwd()` but safer when current directory is wrong
export const safeGetCwd = function (cwdOpt?: string) {
  try {
    const cwd = getCwdValue(cwdOpt)

    if (!existsSync(cwd)) {
      return Promise.resolve('')
    }

    return Promise.resolve(cwd)
  } catch {
    return Promise.resolve('')
  }
}

const getCwdValue = function (cwdOpt = process.cwd()) {
  return normalize(cwdOpt)
}
