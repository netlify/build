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

/** Find all packages inside a provided directory */
async function findPackages(project: Project, dir: string, depth?: string) {
  const found: string[] = []
  let content: Record<string, DirType> = {}
  try {
    const startDir = project.root ? project.fs.resolve(project.root, dir) : project.fs.resolve(dir)
    content = await project.fs.readDir(startDir, true)
  } catch (err) {
    // noop
  }

  for (const [part, type] of Object.entries(content)) {
    if (part === 'package.json') {
      found.push(dir)
    }

    if (depth && type === 'directory') {
      found.push(...(await findPackages(project, project.fs.join(dir, part), depth === '**' ? depth : undefined)))
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
    results.push(...(await findPackages(project, dir, depth)))
  }

  // initially add all results to the set
  // and filter out then the negated patterns
  const filtered = new Set<string>()

  for (const result of results) {
    for (const pattern of patterns) {
      const matcher = new Minimatch(pattern)
      if (minimatch(result, matcher.pattern)) {
        filtered.add(result)
        if (matcher.negate) {
          filtered.delete(result)
        }
      }
    }
  }

  return [...filtered]
}
