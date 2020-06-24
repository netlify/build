const { homedir } = require('os')
const { dirname, normalize } = require('path')

const findUp = require('find-up')

// Find out repository root among (in priority order):
//  - `repositoryRoot` option
//  - find a `.git`, `.netlify` or `netlify.toml` up from `cwd`
//  - `cwd` (fallback)
const getRepositoryRoot = async function({ repositoryRoot, cwd }) {
  if (repositoryRoot !== undefined) {
    return repositoryRoot
  }

  const repositoryRootA = await findRepositoryRoot(cwd)

  if (repositoryRootA === undefined) {
    return cwd
  }

  return repositoryRootA
}

// Run in parallel (both inside each dir and across dirs), for best performance.
// `find-up` requires either `file` or `directory` to be specified as `type`,
// which is why we cannot pass an array of files as argument, and must use this
// extra logic instead.
const findRepositoryRoot = async function(cwd) {
  const results = await Promise.all(REPOSITORY_ROOT_FILES.map(({ filename, type }) => findUp(filename, { cwd, type })))
  return results
    .filter(Boolean)
    .map(dirname)
    .map(normalize)
    .filter(isNotHomeDir)
    .find(isHighestDir)
}

const REPOSITORY_ROOT_FILES = [
  { filename: '.git', type: 'directory' },
  { filename: '.netlify', type: 'directory' },
  { filename: 'netlify.toml', type: 'file' },
]

// The home directory hosts the global .netlify configuration, so we exclude it
const isNotHomeDir = function(dir) {
  return dir !== homedir()
}

const isHighestDir = function(dir, index, dirs) {
  return dirs.slice(index + 1).every(dirA => dirA.length >= dir.length)
}

module.exports = { getRepositoryRoot }
