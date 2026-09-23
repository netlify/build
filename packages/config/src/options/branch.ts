import { execaCommand } from 'execa'

const FALLBACK_BRANCH = 'master'

/** The `branch` option, else the git `HEAD` branch, else `main` if it exists, else `master`. */
export const getBranch = async function ({
  branch,
  repositoryRoot,
}: {
  branch?: string
  repositoryRoot: string
}): Promise<string> {
  if (branch) {
    return branch
  }

  return (await getGitBranch(repositoryRoot, 'HEAD')) ?? (await getGitBranch(repositoryRoot, 'main')) ?? FALLBACK_BRANCH
}

const getGitBranch = async function (repositoryRoot: string, gitRef: string): Promise<string | undefined> {
  try {
    const { stdout } = await execaCommand(`git rev-parse --abbrev-ref ${gitRef}`, { cwd: repositoryRoot })
    return stdout
  } catch {
    return undefined
  }
}
