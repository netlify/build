import { join, resolve } from 'path'

import mapObject from 'map-obj'

import { getZisiFeatureFlags } from './feature_flags.js'

export const getZisiParameters = ({
  buildDir,
  childEnv,
  featureFlags,
  functionsConfig,
  functionsDist,
  isRunningLocally,
  repositoryRoot,
}) => {
  const nodeVersion = childEnv.AWS_LAMBDA_JS_RUNTIME
  const manifest = join(functionsDist, 'manifest.json')
  const config = mapObject(functionsConfig, (expression, object) => [
    expression,
    normalizeFunctionConfig({ buildDir, featureFlags, functionConfig: object, isRunningLocally, nodeVersion }),
  ])
  const zisiFeatureFlags = getZisiFeatureFlags(featureFlags)

  return { basePath: buildDir, config, manifest, featureFlags: zisiFeatureFlags, repositoryRoot }
}

// The function configuration keys returned by @netlify/config are not an exact
// match to the properties that @netlify/zip-it-and-ship-it expects. We do that
// translation here.
export const normalizeFunctionConfig = ({ buildDir, functionConfig = {}, isRunningLocally, nodeVersion }) => ({
  externalNodeModules: functionConfig.external_node_modules,
  includedFiles: functionConfig.included_files,
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
