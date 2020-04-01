const del = require('del')
const execa = require('execa')

const { getTempDir } = require('./temp')

// Create a temporary directory with a `.git` directory, which can be used as
// the current directory of a build. Otherwise the `git` utility does not load.
const createRepoDir = async function({ git = true } = {}) {
  const cwd = await getTempDir()
  await createGit(cwd, git)
  return cwd
}

const createGit = async function(cwd, git) {
  if (!git) {
    return
  }

  await execa.command('git init', { cwd })
  await execa.command('git config user.email test@test.com', { cwd })
  await execa.command('git config user.name test', { cwd })
  await execa.command('git commit --no-gpg-sign --allow-empty -m one', { cwd })
  await execa.command('git config --unset user.email', { cwd })
  await execa.command('git config --unset user.name', { cwd })
}

// Removing a directory sometimes fails on Windows in CI due to Windows
// directory locking.
// This results in `EBUSY: resource busy or locked, rmdir /path/to/dir`
const removeDir = async function(dir) {
  try {
    await del(dir, { force: true })
    // eslint-disable-next-line no-empty
  } catch (error) {}
}

module.exports = { createRepoDir, removeDir }
