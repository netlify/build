import { join } from 'node:path'

import { logDbProvisioning, logDbMigrations } from '../../log/messages/core_steps.js'
import { getPackageJson, type PackageJson } from '../../utils/package.js'
import { CoreStep, CoreStepCondition, CoreStepFunction } from '../types.js'
import { readMigrationEntries, getMigrationNames } from './utils.js'

const NPM_PACKAGE_NAME = '@netlify/database'

// TODO: Remove once we stop supporting the legacy `@netlify/db` package name.
const NPM_PACKAGE_NAME_LEGACY = '@netlify/db'

const condition: CoreStepCondition = async ({ buildDir, packagePath, featureFlags }) => {
  if (!featureFlags?.netlify_build_db_setup) {
    return false
  }

  const { packageJson } = await getPackageJson(buildDir)

  if (hasDBPackage(packageJson)) {
    return true
  }

  if (packagePath) {
    const { packageJson: workspacePackageJson } = await getPackageJson(join(buildDir, packagePath))

    if (hasDBPackage(workspacePackageJson)) {
      return true
    }
  }

  return false
}

// TODO: Remove once database methods are made public.
interface TemporaryDatabaseResponse {
  connection_string: string
}

const coreStep: CoreStepFunction = async ({ api, branch, buildDir, constants, context, logs }) => {
  const siteId = constants.SITE_ID

  logDbProvisioning({ logs, branch, context })

  const entries = await readMigrationEntries(buildDir, constants.DB_MIGRATIONS_SRC)
  const migrationNames = getMigrationNames(entries)
  if (migrationNames.length > 0) {
    logDbMigrations({ logs, migrations: migrationNames, srcDir: constants.DB_MIGRATIONS_SRC! })
  }

  // @ts-expect-error This is an internal method for now so it isn't typed yet.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const database = (await api.createSiteDatabase({ site_id: siteId })) as TemporaryDatabaseResponse

  let connectionString: string = database.connection_string

  if (context !== 'production') {
    // @ts-expect-error This is an internal method for now so it isn't typed yet.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const databaseBranch = (await api.createSiteDatabaseBranch({
      site_id: siteId,
      body: { branch_id: branch },
    })) as TemporaryDatabaseResponse

    connectionString = databaseBranch.connection_string
  }

  process.env.NETLIFY_DB_URL = connectionString

  return { newEnvChanges: { NETLIFY_DB_URL: connectionString } }
}

const hasDBPackage = (packageJSON: PackageJson): boolean => {
  const { dependencies = {}, devDependencies = {} } = packageJSON

  return (
    NPM_PACKAGE_NAME in dependencies ||
    NPM_PACKAGE_NAME in devDependencies ||
    NPM_PACKAGE_NAME_LEGACY in dependencies ||
    NPM_PACKAGE_NAME_LEGACY in devDependencies
  )
}

export const dbSetup: CoreStep = {
  event: 'onPreBuild',
  coreStep,
  coreStepId: 'db_provision',
  coreStepName: 'Netlify Database setup',
  coreStepDescription: () => 'Netlify Database setup',
  condition,
}
