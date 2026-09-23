import { join } from 'path'

import { type PackageJson } from 'read-package-up'
import semver from 'semver'

import { importJsonFile } from '../utils/json.js'
import { resolvePath } from '../utils/resolve.js'

type ConditionContext = {
  nodeVersion: string
  packageJson: PackageJson
  buildDir: string
  packagePath?: string | undefined
}

type ConditionValues = {
  nodeVersion: string
  siteDependencies: Record<string, string>
}

type ConditionType = keyof ConditionValues

export type PluginCondition<Type extends ConditionType = ConditionType> = {
  [T in Type]: { type: T; condition: ConditionValues[T] }
}[Type]

type Conditions = {
  [T in ConditionType]: {
    test: (condition: ConditionValues[T], ctx: ConditionContext) => boolean | Promise<boolean>
    warning: (condition: ConditionValues[T]) => string
  }
}

/**
 * Plugins can use `compatibility.{version}.nodeVersion: 'allowedNodeVersion'`
 * to deliver different plugin versions based on the Node.js version
 */
const nodeVersionTest = (allowedNodeVersion: string, { nodeVersion }: ConditionContext) =>
  semver.satisfies(nodeVersion, allowedNodeVersion)

const nodeVersionWarning = (allowedNodeVersion: string) => `Node.js ${allowedNodeVersion}`

const siteDependenciesTest = async function (
  allowedSiteDependencies: Record<string, string>,
  { packageJson: { devDependencies = {}, dependencies = {} }, packagePath, buildDir }: ConditionContext,
): Promise<boolean> {
  let siteDependencies = { ...devDependencies, ...dependencies }

  // If there is a packagePath in a mono repository add the dependencies from the package as well
  // the packageJson is in this case only the top root package json which does not contain all the dependencies to test for
  const pkgJsonPath = packagePath && join(buildDir, packagePath, 'package.json')
  if (pkgJsonPath) {
    try {
      const { devDependencies: devDepsPgk = {}, dependencies: depsPkg = {} } =
        await importJsonFile<PackageJson>(pkgJsonPath)
      siteDependencies = { ...siteDependencies, ...devDepsPgk, ...depsPkg }
    } catch {
      // noop
    }
  }

  return (
    await Promise.all(
      Object.entries(allowedSiteDependencies).map(async ([dependencyName, allowedVersion]) =>
        siteDependencyTest({ dependencyName, allowedVersion, siteDependencies, buildDir, packagePath }),
      ),
    )
  ).every(Boolean)
}

const siteDependencyTest = async function ({
  dependencyName,
  allowedVersion,
  siteDependencies,
  buildDir,
  packagePath,
}: {
  dependencyName: string
  allowedVersion: string
  buildDir: string
  packagePath?: string | undefined
  siteDependencies: Record<string, string | undefined>
}): Promise<boolean> {
  const siteDependency = siteDependencies[dependencyName]
  if (typeof siteDependency !== 'string') {
    return false
  }

  // if this is a valid version we can apply the rule directly
  if (semver.clean(siteDependency) !== null) {
    return semver.satisfies(siteDependency, allowedVersion, { includePrerelease: true })
  }

  try {
    // if this is a range we need to get the exact version
    const packageJsonPath = await resolvePath(`${dependencyName}/package.json`, join(buildDir, packagePath ?? ''))
    const { version } = await importJsonFile<PackageJson>(packageJsonPath)
    if (!version) {
      return false
    }
    return semver.satisfies(version, allowedVersion)
  } catch {
    return false
  }
}

const siteDependenciesWarning = function (allowedSiteDependencies: Record<string, string>) {
  return Object.entries(allowedSiteDependencies).map(siteDependencyWarning).join(',')
}

const siteDependencyWarning = function ([dependencyName, allowedVersion]: [string, string]) {
  return `${dependencyName}@${allowedVersion}`
}

export const CONDITIONS: Conditions = {
  nodeVersion: { test: nodeVersionTest, warning: nodeVersionWarning },
  siteDependencies: { test: siteDependenciesTest, warning: siteDependenciesWarning },
}

export const testCondition = function <Type extends ConditionType>(
  { type, condition }: PluginCondition<Type>,
  ctx: ConditionContext,
): boolean | Promise<boolean> {
  return CONDITIONS[type].test(condition, ctx)
}

export const getConditionWarning = function <Type extends ConditionType>({
  type,
  condition,
}: PluginCondition<Type>): string {
  return CONDITIONS[type].warning(condition)
}
