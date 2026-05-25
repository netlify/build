import { readdir, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'

import { pathExists } from 'path-exists'

// TODO: Remove once we drop support for the legacy `netlify/db/migrations` directory.
const LEGACY_DB_MIGRATIONS_SRC = 'netlify/db/migrations'

/**
 * Returns the effective migrations source directory for the current build.
 *
 * If the user has set `database.migrations.path` in their config, or the new
 * default `netlify/database/migrations` directory exists, that value will have
 * been populated into `constants.DB_MIGRATIONS_SRC` upstream. If not, we fall
 * back to the legacy `netlify/db/migrations` directory for backwards
 * compatibility.
 */
// TODO: Remove the legacy fallback once we drop support for `netlify/db/migrations`.
export const getMigrationsSrc = async (
  buildDir: string,
  configuredSrc: string | undefined,
): Promise<string | undefined> => {
  if (configuredSrc) {
    return configuredSrc
  }
  if (await pathExists(resolve(buildDir, LEGACY_DB_MIGRATIONS_SRC))) {
    return LEGACY_DB_MIGRATIONS_SRC
  }
  return undefined
}

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
