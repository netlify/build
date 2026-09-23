import { execa } from 'execa'

import { removeFalsy } from '../utils/remove_falsy.js'

/**
 * Git environment variables. There may be no git repository, or no git. This deliberately doesn't
 * use `@netlify/git-utils`.
 */
export const getGitEnv = async function (buildDir: string, branch: string) {
  const [COMMIT_REF, CACHED_COMMIT_REF] = await Promise.all([
    git(['rev-parse', 'HEAD'], buildDir),
    git(['rev-parse', 'HEAD^'], buildDir),
  ])
  return removeFalsy({ BRANCH: branch, HEAD: branch, COMMIT_REF, CACHED_COMMIT_REF, PULL_REQUEST: 'false' })
}

const git = async function (args: string[], cwd: string): Promise<string | undefined> {
  try {
    const { stdout } = await execa('git', args, { cwd })
    return stdout
  } catch {
    return undefined
  }
}
