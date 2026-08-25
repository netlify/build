import { dirname } from 'path'

import { dir as findUp } from 'empathic/find'

// Find out repository root among (in priority order):
//  - `repositoryRoot` option
//  - find a `.git` directory up from `cwd`
//  - `cwd` (fallback)
export const getRepositoryRoot = async function ({ repositoryRoot, cwd }) {
  if (repositoryRoot !== undefined) {
    return repositoryRoot
  }

  const repositoryRootA = findUp('.git', { cwd })

  if (repositoryRootA === undefined) {
    return cwd
  }

  return dirname(repositoryRootA)
}
