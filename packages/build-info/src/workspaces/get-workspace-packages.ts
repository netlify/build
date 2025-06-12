import { minimatch, Minimatch } from 'minimatch'
import { type PackageJson } from 'read-pkg'

import { DirType } from '../file-system.js'
import type { Project } from '../project.js'

import type { WorkspacePackage } from './detect-workspace.js'

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
  project: Project
  entry: string
  type: DirType
  packagePath: string
  directory: string
}) => Promise<WorkspacePackage | null>

const defaultIdentifyPackage: identifyPackageFn = async ({ entry, project, directory, packagePath }) => {
  if (entry === 'package.json') {
    const pkg: WorkspacePackage = { path: packagePath }

    try {
      const { name } = await project.fs.readJSON<PackageJson>(project.fs.join(directory, entry))
      pkg.name = name
    } catch {
      // noop
    }
    return pkg
  }

  return null
}

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
  let content: Record<string, DirType> = {}
  const startDir = project.jsWorkspaceRoot
    ? project.fs.resolve(project.jsWorkspaceRoot, dir)
    : project.root
      ? project.fs.resolve(project.root, dir)
      : project.fs.resolve(dir)
  try {
    content = await project.fs.readDir(startDir, true)
  } catch {
    // noop
  }

  const foundPromises = Object.entries(content).map(async ([part, type]) => {
    const identified = await identifyPackage({ entry: part, type, packagePath: dir, directory: startDir, project })
    if (identified) {
      return [identified]
    }

    if (depth && type === 'directory') {
      return findPackages(project, project.fs.join(dir, part), identifyPackage, depth === '**' ? depth : undefined)
    }
    return []
  }) as Promise<WorkspacePackage[]>[]

  const found = await Promise.all(foundPromises)
  return found.flat()
}

/** Get a list of all workspace package paths (absolute paths) */
export async function getWorkspacePackages(project: Project, patterns: string[] = []): Promise<WorkspacePackage[]> {
  if (!patterns?.length) {
    return []
  }

  // perform a parallel detection of all workspace packages
  const results = (
    await Promise.all(
      patterns.map((pattern) => {
        const cleanedPattern = pattern.replace(/^!?(\.\/)/, (match, p1) => match.replace(p1, ''))
        const matcher = new Minimatch(cleanedPattern)
        if (matcher.negate) {
          return
        }
        const { dir, depth } = getDirFromPattern(matcher)
        return findPackages(project, dir, defaultIdentifyPackage, depth)
      }),
    )
  )
    .flat() // flatten the nested array
    .filter(Boolean) as WorkspacePackage[] // filter out the negate patterns

  // initially add all results to the set
  // and filter out then the negated patterns
  const filtered = new Map<string, WorkspacePackage>()

  for (const result of results) {
    for (const pattern of patterns) {
      const cleanedPattern = pattern.replace(/^!?(\.\/)/, (match, p1) => match.replace(p1, ''))
      const matcher = new Minimatch(cleanedPattern)
      if (minimatch(result.path, matcher.pattern)) {
        filtered.set(project.fs.join(result.path), result)
        if (matcher.negate) {
          filtered.delete(project.fs.join(result.path))
        }
      }
    }
  }

  return [...filtered.values()]
}
