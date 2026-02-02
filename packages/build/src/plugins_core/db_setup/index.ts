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

const coreStep: CoreStepFunction = async ({ api, constants }) => {
  await api.getSite({ siteId: constants.SITE_ID })

  process.env.NETLIFY_DB_URL = 'foobar'

  return { newEnvChanges: { NETLIFY_DB_URL: 'foobar' } }
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
