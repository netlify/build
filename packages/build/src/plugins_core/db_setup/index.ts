import { join } from 'node:path'

import { logDbProvisioning, logDbMigrations } from '../../log/messages/core_steps.js'
import { getPackageJson, type PackageJson } from '../../utils/package.js'
import { CoreStep, CoreStepCondition, CoreStepFunction } from '../types.js'
import { getDatabaseBranchId, readMigrationEntries, getMigrationNames, getMigrationsSrc } from './utils.js'

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

const coreStep: CoreStepFunction = async ({ api, branch, buildDir, constants, context, deployId, logs }) => {
  const siteId = constants.SITE_ID

  logDbProvisioning({ logs, branch, context })

  const migrationsSrc = await getMigrationsSrc(buildDir, constants.DB_MIGRATIONS_SRC)
  const entries = await readMigrationEntries(buildDir, migrationsSrc)
  const migrationNames = getMigrationNames(entries)
  if (migrationNames.length > 0 && migrationsSrc) {
    logDbMigrations({ logs, migrations: migrationNames, srcDir: migrationsSrc })
  }

  const database = (await api.createSiteDatabase({ site_id: siteId })) as TemporaryDatabaseResponse

  let connectionString: string = database.connection_string

  if (context !== 'production') {
    const databaseBranch = (await api.createSiteDatabaseBranch({
      site_id: siteId,
      body: { branch_id: getDatabaseBranchId({ branch, deployId }) },
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
