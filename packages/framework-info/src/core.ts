import pFilter from 'p-filter'
import type { PackageJson } from 'read-pkg-up'

import type { Context, PathExists } from './context.js'
import { usesFramework } from './detect.js'
import { getDevCommands } from './dev.js'
import type { FrameworkName } from './generated/frameworkNames.js'
import { FRAMEWORKS } from './generated/frameworks.js'
import { getPackageJsonContent } from './package.js'
import { getPlugins } from './plugins.js'
import { getRunScriptCommand } from './run_script.js'
import type { Framework, FrameworkDefinition } from './types.js'

const getContext = (context: Context) => {
  const { pathExists, packageJson, packageJsonPath = '.', nodeVersion } = context

  return { pathExists, packageJson, packageJsonPath, nodeVersion }
}

/**
 * Return all the frameworks used by a project.
 */
export const listFrameworks = async function (context: Context): Promise<Framework[]> {
  const { pathExists, packageJson, packageJsonPath, nodeVersion } = getContext(context)
  const { npmDependencies, scripts, runScriptCommand } = await getProjectInfo({
    pathExists,
    packageJson,
    packageJsonPath,
  })
  const frameworks = await pFilter(FRAMEWORKS, (framework) => usesFramework(framework, { pathExists, npmDependencies }))
  const frameworkInfos = frameworks.map((framework) => {
    const frameworkVersion = npmDependencies[framework.detect.npmDependencies[0]]
    return getFrameworkInfo(framework, { scripts, runScriptCommand, nodeVersion, frameworkVersion })
  })
  return frameworkInfos
}

/**
 * Return whether a project uses a specific framework
 */
export const hasFramework = async function (frameworkId: FrameworkName, context: Context): Promise<boolean> {
  const framework = getFrameworkById(frameworkId)
  const { pathExists, packageJson, packageJsonPath } = getContext(context)
  const { npmDependencies } = await getProjectInfo({ pathExists, packageJson, packageJsonPath })
  const result = await usesFramework(framework, { pathExists, npmDependencies })
  return result
}

/**
 * Return some information about a framework used by a project.
 */
export const getFramework = async function (frameworkId: FrameworkName, context: Context): Promise<Framework> {
  const framework = getFrameworkById(frameworkId)
  const { pathExists, packageJson, packageJsonPath, nodeVersion } = getContext(context)
  const { scripts, runScriptCommand, npmDependencies } = await getProjectInfo({
    pathExists,
    packageJson,
    packageJsonPath,
  })
  const frameworkVersion = npmDependencies[framework.detect.npmDependencies[0]]
  const frameworkInfo = getFrameworkInfo(framework, { scripts, runScriptCommand, nodeVersion, frameworkVersion })
  return frameworkInfo
}
/**
 * Gets the framework by its id
 * @param {string} frameworkId - Id such as `"gatsby"`
 * @returns
 */

export const getFrameworkById = function (frameworkId: FrameworkName): FrameworkDefinition {
  const framework = FRAMEWORKS.find(({ id }) => id === frameworkId)
  if (framework === undefined) {
    const frameworkIds = FRAMEWORKS.map((knownFramework) => getFrameworkId(knownFramework))
      .sort()
      .join(', ')
    throw new Error(`Invalid framework "${frameworkId}". It should be one of: ${frameworkIds}`)
  }

  return framework
}

const getFrameworkId = function ({ id }: FrameworkDefinition): string {
  return id
}

const getProjectInfo = async function ({
  pathExists,
  packageJson,
  packageJsonPath,
}: {
  pathExists: PathExists
  packageJson: PackageJson | undefined
  packageJsonPath: string
}) {
  const { npmDependencies, scripts } = getPackageJsonContent(packageJson)
  const runScriptCommand = await getRunScriptCommand({ pathExists, packageJsonPath })
  return { npmDependencies, scripts, runScriptCommand }
}

const getFrameworkInfo = function (
  {
    id,
    name,
    detect,
    category,
    dev: { command: frameworkDevCommand, port, pollingStrategies },
    build: { command: frameworkBuildCommand, directory },
    staticAssetsDirectory,
    env,
    logo,
    plugins,
  }: FrameworkDefinition,
  {
    scripts,
    runScriptCommand,
    nodeVersion,
    frameworkVersion,
  }: {
    scripts: Record<string, string>
    runScriptCommand: string
    nodeVersion: string
    frameworkVersion?: string
  },
): Framework {
  const devCommands = getDevCommands({ frameworkDevCommand, scripts, runScriptCommand })
  const recommendedPlugins = getPlugins(plugins, { nodeVersion, frameworkVersion })

  return {
    id,
    name,
    package: {
      name: detect.npmDependencies[0],
      version: 'unknown',
    },
    category,
    dev: { commands: devCommands, port, pollingStrategies },
    build: { commands: [frameworkBuildCommand], directory },
    staticAssetsDirectory,
    env,
    logo,
    plugins: recommendedPlugins,
  }
}
