import { dirname } from 'path'

import { findUp } from 'find-up'

/** The `repositoryRoot` option, else the closest directory with a `.git` directory, else `cwd`. */
export const getRepositoryRoot = async function ({
  repositoryRoot,
  cwd,
}: {
  repositoryRoot?: string
  cwd: string
}): Promise<string> {
  if (repositoryRoot !== undefined) {
    return repositoryRoot
  }

  const gitDirectory = await findUp('.git', { cwd, type: 'directory' })
  return gitDirectory === undefined ? cwd : dirname(gitDirectory)
}
