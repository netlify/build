import { copyFile, mkdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'

import { pathExists } from 'path-exists'

import { CoreStep, CoreStepCondition, CoreStepFunction } from '../types.js'
import { readMigrationEntries } from './utils.js'
import { validateMigrations, formatValidationErrors } from './validation.js'

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

  const { dirNames, fileNames } = await readMigrationEntries(buildDir, constants.DB_MIGRATIONS_SRC)

  if (dirNames.length === 0 && fileNames.length === 0) {
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

  const result = validateMigrations(dirNames, fileNames, existingSqlFiles)

  if (!result.valid) {
    const message = formatValidationErrors(result.errors)
    throw new Error(message)
  }

  for (const dirName of result.dirs) {
    const migrationDestDir = join(destDir, dirName)
    await mkdir(migrationDestDir, { recursive: true })
    await copyFile(join(srcDir, dirName, 'migration.sql'), join(migrationDestDir, 'migration.sql'))
  }

  for (const fileName of result.files) {
    const stem = fileName.replace(/\.sql$/, '')
    const migrationDestDir = join(destDir, stem)
    await mkdir(migrationDestDir, { recursive: true })
    await copyFile(join(srcDir, fileName), join(migrationDestDir, 'migration.sql'))
  }

  const totalCount = result.dirs.length + result.files.length
  systemLog(`Copied ${String(totalCount)} migration(s) to ${destDir}`)

  return {}
}

export const copyDbMigrations: CoreStep = {
  event: 'onBuild',
  coreStep,
  coreStepId: 'db_migrations_copy',
  coreStepName: 'Netlify DB migrations',
  coreStepDescription: () => 'Copy database migrations to internal directory',
  condition,
  quiet: true,
}
