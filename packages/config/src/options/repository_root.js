import { dirname } from 'path'

import { findUp } from 'find-up'

// Find out repository root among (in priority order):
//  - `repositoryRoot` option
//  - find a `.git` directory or file up from `cwd`
//  - `cwd` (fallback)
// Git worktrees use a `.git` file (not a directory). find-up defaults to
// type "file", so check directories first then files.
export const getRepositoryRoot = async function ({ repositoryRoot, cwd }) {
  if (repositoryRoot !== undefined) {
    return repositoryRoot
  }

  const repositoryRootA =
    (await findUp('.git', { cwd, type: 'directory' })) ?? (await findUp('.git', { cwd, type: 'file' }))

  if (repositoryRootA === undefined) {
    return cwd
  }

  return dirname(repositoryRootA)
}
