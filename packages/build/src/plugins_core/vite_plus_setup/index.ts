import { homedir } from 'node:os'
import { join } from 'node:path'

import { execa } from 'execa'

import { log } from '../../log/logger.js'
import { THEME } from '../../log/theme.js'
import { getPackageJson, type PackageJson } from '../../utils/package.js'
import { CoreStep, CoreStepCondition, CoreStepFunction } from '../types.js'

const NPM_PACKAGE_NAME = 'vite-plus'
const INSTALL_URL = 'https://vite.plus'

export const hasVitePlusPackage = (packageJSON: PackageJson): boolean => {
  const { dependencies = {}, devDependencies = {} } = packageJSON

  return NPM_PACKAGE_NAME in dependencies || NPM_PACKAGE_NAME in devDependencies
}

export const getVitePlusVersion = async (buildDir: string, packagePath?: string): Promise<string> => {
  const { packageJson } = await getPackageJson(buildDir)
  const version = packageJson.devDependencies?.[NPM_PACKAGE_NAME] ?? packageJson.dependencies?.[NPM_PACKAGE_NAME]

  if (version) {
    return version
  }

  if (packagePath) {
    const { packageJson: workspacePackageJson } = await getPackageJson(join(buildDir, packagePath))
    return (
      workspacePackageJson.devDependencies?.[NPM_PACKAGE_NAME] ??
      workspacePackageJson.dependencies?.[NPM_PACKAGE_NAME] ??
      'latest'
    )
  }

  return 'latest'
}

export const installVitePlusCli = async (version: string): Promise<string> => {
  try {
    await execa('bash', ['-c', `curl -fsSL --max-time 120 ${INSTALL_URL} | bash`], {
      env: { ...process.env, VP_VERSION: version, VITE_PLUS_VERSION: version },
      stdio: 'pipe',
    })
  } catch (error) {
    throw new Error(`Failed to install Vite+ CLI: ${error instanceof Error ? error.message : String(error)}`)
  }

  const vitePlusBinDir = join(homedir(), '.vite-plus', 'bin')
  return vitePlusBinDir
}

const condition: CoreStepCondition = async ({ buildDir, packagePath, featureFlags }) => {
  if (!featureFlags?.netlify_build_vite_plus_setup) {
    return false
  }

  try {
    const { packageJson } = await getPackageJson(buildDir)

    if (hasVitePlusPackage(packageJson)) {
      return true
    }
  } catch {
    // noop — root package.json missing or invalid
  }

  if (packagePath) {
    try {
      const { packageJson: workspacePackageJson } = await getPackageJson(join(buildDir, packagePath))

      if (hasVitePlusPackage(workspacePackageJson)) {
        return true
      }
    } catch {
      // noop — workspace package.json missing or invalid
    }
  }

  return false
}

const coreStep: CoreStepFunction = async ({ buildDir, packagePath, logs }) => {
  const version = await getVitePlusVersion(buildDir, packagePath)

  log(logs, `Installing Vite+ CLI${version !== 'latest' ? ` (${THEME.highlightWords(version)})` : ''}`)

  const vitePlusBinDir = await installVitePlusCli(version)
  const newPath = `${vitePlusBinDir}:${process.env.PATH ?? ''}`
  process.env.PATH = newPath

  log(logs, `Vite+ CLI installed successfully`)

  return { newEnvChanges: { PATH: newPath } }
}

export const vitePlusSetup: CoreStep = {
  event: 'onPreBuild',
  coreStep,
  coreStepId: 'vite_plus_setup',
  coreStepName: 'Vite+ setup',
  coreStepDescription: () => 'Installing Vite+ CLI',
  condition,
}
