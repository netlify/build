import { join, resolve } from 'path'

import { type FunctionConfig, type ZipFunctionsOptions } from '@netlify/zip-it-and-ship-it'
import mapObject from 'map-obj'
import semver from 'semver'

import type { FeatureFlags } from '../../core/feature_flags.js'

import { getZisiFeatureFlags } from './feature_flags.js'

type GetZisiParametersType = {
  branch?: string
  buildDir: string
  childEnv: Record<string, string>
  featureFlags: FeatureFlags
  functionsConfig: Record<string, any>
  functionsDist: string
  internalFunctionsSrc: string | undefined
  isRunningLocally: boolean
  repositoryRoot: string
  userNodeVersion: string
  systemLog: ZipFunctionsOptions['systemLog']
}

const getLambdaNodeVersion = (childEnv: Record<string, string>, userNodeVersion: string): string | undefined => {
  if (childEnv.AWS_LAMBDA_JS_RUNTIME) {
    return childEnv.AWS_LAMBDA_JS_RUNTIME
  }

  // As of time of writing the default Lambda Node.js version is 16 and
  // we do not want to take the risk and downgrade users from this default version on initial release
  // of the dependency between user and lambda Node.js version.
  // The check ensures that if the user version is lower than 16 we keep the default version.
  //
  // TODO: Remove this once Node.js 16 is deprecated. Do NOT change this if the default Lambda version is updated.
  if (semver.gte(userNodeVersion, '16.0.0')) {
    return userNodeVersion
  }

  return undefined
}

export const getZisiParameters = ({
  branch,
  buildDir,
  childEnv,
  featureFlags,
  functionsConfig,
  functionsDist,
  internalFunctionsSrc,
  isRunningLocally,
  repositoryRoot,
  userNodeVersion,
  systemLog,
}: GetZisiParametersType): ZipFunctionsOptions => {
  const nodeVersion = getLambdaNodeVersion(childEnv, userNodeVersion)
  const manifest = join(functionsDist, 'manifest.json')
  const config = mapObject(functionsConfig, (expression, object) => [
    expression,
    normalizeFunctionConfig({ buildDir, functionConfig: object, isRunningLocally, nodeVersion }),
  ])
  const zisiFeatureFlags = getZisiFeatureFlags(featureFlags)

  // Only the legacy internal functions directory is allowed to have a JSON
  // config file.
  const configFileDirectories = internalFunctionsSrc ? [resolve(internalFunctionsSrc)] : undefined

  return {
    basePath: buildDir,
    branch,
    config,
    manifest,
    featureFlags: zisiFeatureFlags,
    repositoryRoot,
    configFileDirectories,
    systemLog,
  }
}

// The function configuration keys returned by @netlify/config are not an exact
// match to the properties that @netlify/zip-it-and-ship-it expects. We do that
// translation here.
export const normalizeFunctionConfig = ({
  buildDir,
  functionConfig = {},
  isRunningLocally,
  nodeVersion,
}: {
  buildDir: string
  functionConfig: Record<string, any>
  isRunningLocally: boolean
  nodeVersion: string | undefined
}): FunctionConfig => ({
  externalNodeModules: functionConfig.external_node_modules,
  includedFiles: functionConfig.included_files,
  name: functionConfig.name,
  includedFilesBasePath: buildDir,
  ignoredNodeModules: functionConfig.ignored_node_modules,
  nodeVersion,
  schedule: functionConfig.schedule,

  // When the user selects esbuild as the Node bundler, we still want to use
  // the legacy ZISI bundler as a fallback. Rather than asking the user to
  // make this decision, we abstract that complexity away by injecting the
  // fallback behavior ourselves. We do this by transforming the value
  // `esbuild` into `esbuild_zisi`, which zip-it-and-ship-it understands.
  nodeBundler: functionConfig.node_bundler === 'esbuild' ? 'esbuild_zisi' : functionConfig.node_bundler,

  // If the build is running in buildbot, we set the Rust target directory to a
  // path that will get cached in between builds, allowing us to speed up the
  // build process.
  rustTargetDirectory: isRunningLocally ? undefined : resolve(buildDir, '.netlify', 'rust-functions-cache', '[name]'),

  // Go functions should be zipped only when building locally. When running in
  // buildbot, the Go API client will handle the zipping.
  zipGo: isRunningLocally ? true : undefined,
})
