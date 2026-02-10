import { copyFile, mkdir, readdir, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'

import { pathExists } from 'path-exists'

import { CoreStep, CoreStepCondition, CoreStepFunction } from '../types.js'
import { validateMigrationDirs, formatValidationErrors } from './validation.js'

const condition: CoreStepCondition = async ({ featureFlags, constants, buildDir }) => {
  if (!featureFlags?.netlify_build_db_setup) {
    return false
  }

  const srcDir = constants.DB_MIGRATIONS_SRC
  if (!srcDir) {
    return false
  }

  return pathExists(resolve(buildDir, srcDir))
}

const coreStep: CoreStepFunction = async ({ constants, buildDir, systemLog }) => {
  const srcDir = resolve(buildDir, constants.DB_MIGRATIONS_SRC!)
  const destDir = resolve(buildDir, constants.DB_MIGRATIONS_DIST!)

  const entries = await readdir(srcDir)

  const dirNames: string[] = []
  for (const entry of entries) {
    const entryStat = await stat(join(srcDir, entry))
    if (entryStat.isDirectory()) {
      dirNames.push(entry)
    }
  }

  if (dirNames.length === 0) {
    systemLog('No migration directories found, skipping copy.')
    return {}
  }

  const existingSqlFiles = new Set<string>()
  for (const dirName of dirNames) {
    const sqlPath = join(srcDir, dirName, 'migration.sql')
    if (await pathExists(sqlPath)) {
      existingSqlFiles.add(dirName)
    }
  }

  const result = validateMigrationDirs(dirNames, existingSqlFiles)

  if (!result.valid) {
    const message = formatValidationErrors(result.errors)
    throw new Error(message)
  }

  await copyDirRecursive(srcDir, destDir)

  systemLog(`Copied ${String(result.dirs.length)} migration(s) to ${destDir}`)

  return {}
}

const copyDirRecursive = async (src: string, dest: string): Promise<void> => {
  const entries = await readdir(src, { withFileTypes: true })

  await mkdir(dest, { recursive: true })

  for (const entry of entries) {
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)

    if (entry.isDirectory()) {
      await copyDirRecursive(srcPath, destPath)
    } else {
      await copyFile(srcPath, destPath)
    }
  }
}

export const copyDbMigrations: CoreStep = {
  event: 'onBuild',
  coreStep,
  coreStepId: 'db_migrations_copy',
  coreStepName: 'Netlify DB migrations',
  coreStepDescription: () => 'Copy database migrations to internal directory',
  condition,
}
