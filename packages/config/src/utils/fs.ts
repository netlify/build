import { stat } from 'node:fs/promises'

/**
 * Whether `path` exists and is a directory. Returns `false` when the path does
 * not exist, but re-throws any other error (e.g. permission issues).
 */
export const isDirectory = async function (path: string): Promise<boolean> {
  try {
    return (await stat(path)).isDirectory()
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false
    }
    throw error
  }
}
