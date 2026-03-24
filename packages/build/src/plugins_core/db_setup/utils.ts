import { readdir, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'

import { pathExists } from 'path-exists'

export interface MigrationEntries {
  dirNames: string[]
  fileNames: string[]
}

export const readMigrationEntries = async (buildDir: string, migrationsSrc?: string): Promise<MigrationEntries> => {
  const empty: MigrationEntries = { dirNames: [], fileNames: [] }

  if (!migrationsSrc) {
    return empty
  }

  const srcDir = resolve(buildDir, migrationsSrc)
  if (!(await pathExists(srcDir))) {
    return empty
  }

  const entries = await readdir(srcDir)
  const dirNames: string[] = []
  const fileNames: string[] = []

  for (const entry of entries) {
    const entryStat = await stat(join(srcDir, entry))
    if (entryStat.isDirectory()) {
      dirNames.push(entry)
    } else if (entry.endsWith('.sql')) {
      fileNames.push(entry)
    }
  }

  return { dirNames, fileNames }
}

export const getMigrationNames = ({ dirNames, fileNames }: MigrationEntries): string[] => [
  ...dirNames,
  ...fileNames.map((f) => f.replace(/\.sql$/, '')),
]
