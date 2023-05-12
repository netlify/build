import { rm } from 'fs/promises'

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
// directory locking. For that reason we retry up to 10 times with 100ms
// linear backoff.
// This results in `EBUSY: resource busy or locked, rmdir /path/to/dir`
export const removeDir = async function (dirs: string | string[]) {
  const dirArray = Array.isArray(dirs) ? dirs : [dirs]

  for (const dir of dirArray) {
    await rm(dir, { force: true, recursive: true, maxRetries: 10 })
  }
}
