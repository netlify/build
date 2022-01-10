import { normalize } from 'path'
import process from 'process'

import pathExists from 'path-exists'

// Like `process.cwd()` but safer when current directory is wrong
export const safeGetCwd = async function (cwdOpt) {
  try {
    const cwd = getCwdValue(cwdOpt)

    if (!(await pathExists(cwd))) {
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
