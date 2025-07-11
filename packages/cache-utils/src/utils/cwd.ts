import { normalize } from 'path'
import { access } from 'fs/promises'
import process from 'process'

// Like `process.cwd()` but safer when current directory is wrong
export const safeGetCwd = async function (cwdOpt?: string) {
  try {
    const cwd = getCwdValue(cwdOpt)

    try {
      await access(cwd)
    } catch {
      return ''
    }

    return cwd
  } catch {
    return ''
  }
}

const getCwdValue = function (cwdOpt = process.cwd()) {
  return normalize(cwdOpt)
}
