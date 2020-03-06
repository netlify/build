const { dirname } = require('path')

const findUp = require('find-up')

// Find out repository root among (in priority order):
//  - `repositoryRoot` option
//  - find a `.git` directory up from `cwd`
//  - `cwd` (fallback)
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

module.exports = { getRepositoryRoot }
