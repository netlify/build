import { existsSync, promises as fs } from 'fs'
import { dirname, relative, resolve, sep } from 'path'

import { findUp } from 'find-up'

import { throwUserError } from './error.js'
import { runGit } from './git.js'
import type { ResolvedOptions } from './options.js'

export interface Directories {
  /** Absolute. */
  cwd: string
  /** Absolute. */
  repositoryRoot: string
  branch: string
  /** The explicit `base` option, or the one implied by `cwd` in a monorepo. */
  base?: string | undefined
  baseRelDir?: boolean | undefined
}

export const resolveDirectories = async function (options: ResolvedOptions): Promise<Directories> {
  const givenRepositoryRoot = options.repositoryRoot ?? (await findRepositoryRoot(options.cwd))
  const branch = options.branch ?? (await getGitBranch(givenRepositoryRoot))
  const cwd = await checkDirectory(options.cwd, 'cwd')
  const repositoryRoot = await checkDirectory(givenRepositoryRoot, 'repositoryRoot')
  const baseOverride = await getBaseOverride(repositoryRoot, cwd)
  return {
    cwd,
    repositoryRoot,
    branch,
    base: options.base ?? baseOverride?.base,
    baseRelDir: options.baseRelDir ?? baseOverride?.baseRelDir,
  }
}

// A `.git` file, as in a worktree, doesn't count.
const findRepositoryRoot = async function (cwd: string): Promise<string> {
  const gitDirectory = await findUp('.git', { cwd, type: 'directory' })
  return gitDirectory === undefined ? cwd : dirname(gitDirectory)
}

const getGitBranch = async function (repositoryRoot: string): Promise<string> {
  return (
    (await getNonBlankGit(['rev-parse', '--abbrev-ref', 'HEAD'], repositoryRoot)) ??
    (await getNonBlankGit(['rev-parse', '--abbrev-ref', 'main'], repositoryRoot)) ??
    'master'
  )
}

const getNonBlankGit = async function (args: string[], cwd: string): Promise<string | undefined> {
  const stdout = await runGit(args, cwd)
  return stdout?.trim() === '' ? undefined : stdout
}

const checkDirectory = async function (path: string, optionName: string): Promise<string> {
  const absolutePath = resolve(path)
  if (!(await isDirectory(absolutePath))) {
    throwUserError(`Option '${optionName}' points to a non-existing directory: ${absolutePath}`)
  }
  return absolutePath
}

const isDirectory = async function (path: string): Promise<boolean> {
  try {
    return (await fs.stat(path)).isDirectory()
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return false
    }
    throw error
  }
}

const BASE_MARKERS = ['.netlify', 'netlify.toml', 'package.json']

// This lets netlify-cli users `cd` into a monorepo package.
const getBaseOverride = async function (
  repositoryRoot: string,
  cwd: string,
): Promise<{ base: string; baseRelDir: true } | undefined> {
  const [realRepositoryRoot, realCwd] = await Promise.all([fs.realpath(repositoryRoot), fs.realpath(cwd)])
  const baseDirectory = getDirectoriesBelow(realCwd, realRepositoryRoot).find((directory) =>
    BASE_MARKERS.some((marker) => existsSync(`${directory}/${marker}`)),
  )
  if (baseDirectory === undefined) {
    return undefined
  }

  // QUIRK: relative to the root before `realpath`, so a symlink in the root's path gives a `../` base.
  return { base: relative(repositoryRoot, baseDirectory), baseRelDir: true }
}

const getDirectoriesBelow = function (directory: string, root: string): string[] {
  const directories: string[] = []
  for (let current = directory; current.startsWith(`${root}${sep}`); current = dirname(current)) {
    directories.push(current)
  }
  return directories
}
