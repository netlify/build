import { promises as fs } from 'node:fs'
import path from 'node:path'

export const listRecursively = async (dirPath: string): Promise<string[]> => {
  const entries: string[] = []

  async function walk(currentPath: string): Promise<void> {
    const dirents = await fs.readdir(currentPath, { withFileTypes: true })
    for (const dirent of dirents) {
      const fullPath = path.join(currentPath, dirent.name)

      if (dirent.isDirectory()) {
        await walk(fullPath)
      } else if (dirent.isFile() || dirent.isSymbolicLink()) {
        entries.push(fullPath)
      }
    }
  }

  await walk(dirPath)

  return entries
}

/**
 * Returns all the directories obtained by traversing `inner` and its parents
 * all the way to `outer`, inclusive.
 */
export const pathsBetween = (inner: string, outer: string, paths: string[] = []): string[] => {
  const parent = path.dirname(inner)

  if (inner === outer || inner === parent) {
    return [...paths, outer]
  }

  return [inner, ...pathsBetween(parent, outer)]
}
