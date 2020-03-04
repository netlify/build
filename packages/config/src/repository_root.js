const { dirname } = require('path')

const findUp = require('find-up')

// Add a default value for the `repositoryRoot` option.
// Do it by trying to find a `.git` directory up from `cwd`.
// If nothing is found, default to `cwd`.
const addDefaultRepositoryRoot = async function(opts) {
  const repositoryRoot = await getRepositoryRoot(opts)
  return { ...opts, repositoryRoot }
}

const getRepositoryRoot = async function({ repositoryRoot, cwd }) {
  if (repositoryRoot !== undefined) {
    return repositoryRoot
  }

  const repositoryRootA = await findUp('.git', { cwd, type: 'directory' })

  if (repositoryRootA === undefined) {
    return cwd
  }

  return dirname(repositoryRootA)
}

module.exports = { addDefaultRepositoryRoot }
