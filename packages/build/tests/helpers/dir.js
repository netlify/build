import del from 'del'
import { execaCommand } from 'execa'

import { getTempDir } from './temp.js'

// Create a temporary directory with a `.git` directory, which can be used as
// the current directory of a build. Otherwise the `git` utility does not load.
export const createRepoDir = async function ({ git = true } = {}) {
  const cwd = await getTempDir()
  await createGit(cwd, git)
  return cwd
}

const createGit = async function (cwd, git) {
  if (!git) {
    return
  }

  await execaCommand('git init', { cwd })
  await execaCommand('git config user.email test@test.com', { cwd })
  await execaCommand('git config user.name test', { cwd })
  await execaCommand('git commit --no-gpg-sign --allow-empty -m one', { cwd })
  await execaCommand('git config --unset user.email', { cwd })
  await execaCommand('git config --unset user.name', { cwd })
}

// Removing a directory sometimes fails on Windows in CI due to Windows
// directory locking.
// This results in `EBUSY: resource busy or locked, rmdir /path/to/dir`
export const removeDir = async function (dir) {
  try {
    await del(dir, { force: true })
  } catch {}
}
