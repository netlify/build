import del from 'del'
import { execaCommandSync } from 'execa'

import { getTempDir } from './temp.js'

/**
 * Create a temporary directory with a `.git` directory, which can be used as
 * the current directory of a build. Otherwise the `git` utility does not load.
 */
export const createRepoDir = (git = true) => {
  const cwd = getTempDir()
  if (git) {
    createGit(cwd)
  }
  return cwd
}

const createGit = (cwd: string) => {
  execaCommandSync('git init', { cwd })
  execaCommandSync('git config user.email test@test.com', { cwd })
  execaCommandSync('git config user.name test', { cwd })
  execaCommandSync('git commit --no-gpg-sign --allow-empty -m one', { cwd })
  execaCommandSync('git config --unset user.email', { cwd })
  execaCommandSync('git config --unset user.name', { cwd })
}

// Removing a directory sometimes fails on Windows in CI due to Windows
// directory locking.
// This results in `EBUSY: resource busy or locked, rmdir /path/to/dir`
export const removeDir = async function (dir) {
  try {
    await del(dir, { force: true })
  } catch {}
}
