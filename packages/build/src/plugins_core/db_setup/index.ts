import { join } from 'node:path'

import { getPackageJson, type PackageJson } from '../../utils/package.js'
import { CoreStep, CoreStepCondition, CoreStepFunction } from '../types.js'

const NPM_PACKAGE_NAME = '@netlify/db'

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

const coreStep: CoreStepFunction = async ({ api, constants, context, deployId }) => {
  const siteId = constants.SITE_ID

  // @ts-expect-error This is an internal method for now so it isn't typed yet.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const database = (await api.createSiteDatabase({ site_id: siteId })) as TemporaryDatabaseResponse

  let connectionString: string = database.connection_string

  if (context !== 'production') {
    // @ts-expect-error This is an internal method for now so it isn't typed yet.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const databaseBranch = (await api.createSiteDatabaseBranch({
      site_id: siteId,
      body: { deploy_id: deployId },
    })) as TemporaryDatabaseResponse

    connectionString = databaseBranch.connection_string
  }

  process.env.NETLIFY_DB_URL = connectionString

  return { newEnvChanges: { NETLIFY_DB_URL: connectionString } }
}

const hasDBPackage = (packageJSON: PackageJson): boolean => {
  const { dependencies = {}, devDependencies = {} } = packageJSON

  return NPM_PACKAGE_NAME in dependencies || NPM_PACKAGE_NAME in devDependencies
}

export const dbSetup: CoreStep = {
  event: 'onPreBuild',
  coreStep,
  coreStepId: 'db_provision',
  coreStepName: 'Netlify DB setup',
  coreStepDescription: () => 'Setup Netlify DB database',
  condition,
}
