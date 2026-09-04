import { lstat } from 'fs/promises'
import { dirname, join } from 'path'

import { findUp } from 'find-up'

// Find out repository root among (in priority order):
//  - `repositoryRoot` option
//  - find a `.git` directory or file up from `cwd`
//  - `cwd` (fallback)
// Git worktrees use a `.git` file (not a directory). Walk once and accept
// whichever marker is nearest so a parent `.git` directory cannot hide a
// closer worktree `.git` file.
const gitMarkerIn = async (directory) => {
  const gitPath = join(directory, '.git')
  try {
    await lstat(gitPath)
    return gitPath
  } catch {
    return undefined
  }
}

export const getRepositoryRoot = async function ({ repositoryRoot, cwd }) {
  if (repositoryRoot !== undefined) {
    return repositoryRoot
  }

  const repositoryRootA = await findUp(gitMarkerIn, { cwd })

  if (repositoryRootA === undefined) {
    return cwd
  }

  return dirname(repositoryRootA)
}
