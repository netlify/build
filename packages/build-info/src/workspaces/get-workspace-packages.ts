import minimatch, { Minimatch } from 'minimatch'

import { DirType } from '../file-system.js'
import type { Project } from '../project.js'

/** Get the base directory out of a glob pattern */
function getDirFromPattern(pattern: Minimatch): {
  dir: string
  /** @example '**' | '*' */
  depth?: string
} {
  const dir: string[] = []
  const parts = pattern.globParts[0]

  for (let i = 0, max = parts.length; i < max; i++) {
    if (parts[i].includes('*')) {
      // skip the rest
      return { dir: dir.join('/'), depth: parts[i] }
    }
    dir.push(parts[i])
  }
  return { dir: dir.join('/') }
}

export type identifyPackageFn = (options: {
  entry: string
  type: DirType
  directory: string
}) => Promise<boolean> | boolean

const defaultIdentifyPackage: identifyPackageFn = ({ entry }) => entry === 'package.json'

/** Find all packages inside a provided directory */
export async function findPackages(
  project: Project,
  /**
   * The relative directory it should start checking.
   * If a jsWorkspaceRoot is set it will join it with it otherwise it tries to resolve based on the root
   */
  dir: string,
  /** A function that identifies if a directory is a package. By default it checks if it has a package.json */
  identifyPackage: identifyPackageFn,
  /** The depth to look. It can be either a single star `*` for one directory depth or a `**` for deep checking */
  depth?: string,
) {
  const found: string[] = []
  let content: Record<string, DirType> = {}
  const startDir = project.jsWorkspaceRoot
    ? project.fs.resolve(project.jsWorkspaceRoot, dir)
    : project.root
    ? project.fs.resolve(project.root, dir)
    : project.fs.resolve(dir)
  try {
    content = await project.fs.readDir(startDir, true)
  } catch (err) {
    // noop
  }

  for (const [part, type] of Object.entries(content)) {
    if (await identifyPackage({ entry: part, type, directory: startDir })) {
      found.push(dir)
    }

    if (depth && type === 'directory') {
      found.push(
        ...(await findPackages(
          project,
          project.fs.join(dir, part),
          identifyPackage,
          depth === '**' ? depth : undefined,
        )),
      )
    }
  }
  return found
}

/** Get a list of all workspace package paths (absolute paths) */
export async function getWorkspacePackages(project: Project, patterns: string[]): Promise<string[]> {
  const results: string[] = []
  if (!patterns.length) {
    return results
  }

  for (const pattern of patterns) {
    const matcher = new Minimatch(pattern)
    // skip negated pattern for exploring as we filter at the end
    if (matcher.negate) {
      continue
    }
    const { dir, depth } = getDirFromPattern(matcher)
    results.push(...(await findPackages(project, dir, defaultIdentifyPackage, depth)))
  }

  // initially add all results to the set
  // and filter out then the negated patterns
  const filtered = new Set<string>()

  for (const result of results) {
    for (const pattern of patterns) {
      const matcher = new Minimatch(pattern)
      if (minimatch(result, matcher.pattern)) {
        filtered.add(project.fs.join(result))
        if (matcher.negate) {
          filtered.delete(project.fs.join(result))
        }
      }
    }
  }

  return [...filtered]
}
