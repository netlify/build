import { resolve } from 'path'

import { isDirectory } from 'path-type'

import { mergeSources } from './contexts.js'
import type { Directories } from './directories.js'
import { prefixError, throwUserError } from './error.js'
import { findConfigFile, readConfigFile } from './file.js'
import { mergeHeaders, mergeRedirects } from './headers_redirects.js'
import type { Layers } from './layers.js'
import { normalizeConfig } from './normalize.js'
import { spreadValue } from './normalize_values.js'
import type { ResolvedOptions } from './options.js'
import { resolveConfigPath, resolvePaths } from './paths.js'
import { processSource } from './sources.js'
import type { NetlifyConfig, RawConfig } from './types.js'

export interface Loaded {
  configPath?: string | undefined
  config: NetlifyConfig
  buildDir: string
  headersPath: string
  redirectsPath: string
}

export const loadConfig = async function ({
  options,
  directories,
  layers,
}: {
  options: ResolvedOptions
  directories: Directories
  layers: Layers
}): Promise<Loaded> {
  const { repositoryRoot } = directories
  const initialBase = getInitialBase(layers, repositoryRoot)
  const firstPass = await loadPass({
    options,
    directories,
    layers,
    config: options.config,
    packagePath: options.packagePath,
    configBase: initialBase,
    base: undefined,
  })
  if (!layers.baseRelDir || firstPass.base === initialBase) {
    return firstPass.loaded
  }

  // The first pass's warnings stay logged and its errors were fatal, even though its result is
  // discarded (QUIRK). The `config` option and `packagePath` are not used.
  const secondPass = await loadPass({
    options,
    directories,
    layers,
    config: undefined,
    packagePath: undefined,
    configBase: firstPass.base,
    base: firstPass.base,
  })
  return secondPass.loaded
}

/** Only `inlineConfig` and `defaultConfig` can say where to look: the file is not read yet. */
const getInitialBase = function ({ inlineConfig, defaultConfig }: Layers, repositoryRoot: string): string | undefined {
  const inlineBase = getRawBase(inlineConfig)
  // Not `??`: an inline `null` doesn't fall back to `defaultConfig`.
  const base = inlineBase === undefined ? getRawBase(defaultConfig) : inlineBase
  // Not checked yet: validation reports a base that isn't a string.
  return typeof base === 'string' ? resolveBase(base, repositoryRoot) : undefined
}

const getRawBase = (config: RawConfig): unknown => spreadValue(config['build'])['base']

const resolveBase = (base: string | undefined, repositoryRoot: string): string | undefined =>
  resolveConfigPath(base, { baseRel: repositoryRoot, repositoryRoot, propertyName: 'build.base' })

interface PassOptions {
  options: ResolvedOptions
  directories: Directories
  layers: Layers
  config: string | undefined
  packagePath: string | undefined
  configBase: string | undefined
  /** Known in the second pass, where the file's `build.base` is ignored. */
  base: string | undefined
}

const loadPass = async function ({
  options,
  directories,
  layers,
  config,
  packagePath,
  configBase,
  base: knownBase,
}: PassOptions): Promise<{ loaded: Loaded; base: string | undefined }> {
  const { cwd, repositoryRoot, branch } = directories
  const { context, logs, configMutationsOrigin } = options
  const configPath = await findConfigFile({ config, cwd, repositoryRoot, configBase, packagePath })

  try {
    const fileSource = processSource(await readConfigFile(configPath), 'config')
    const defaultSource = processSource(layers.defaultConfig, 'ui')
    const inlineSource = processSource(layers.inlineConfig, 'inline')
    const merged = mergeSources({
      defaultConfig: defaultSource,
      fileConfig: fileSource,
      inlineConfig: inlineSource,
      context,
      branch,
      logs,
    })
    const normalized = normalizeConfig(merged, { packagePath, logs })

    // A known base is neither resolved nor checked inside the root again (QUIRK). An undefined one
    // comes from the second file, but can't cause a third pass.
    const base = knownBase ?? resolveBase(normalized.build.base, repositoryRoot)
    const buildDir = await getBuildDir(base, repositoryRoot)
    const baseRel = layers.baseRelDir ? buildDir : repositoryRoot
    const withPaths = await resolvePaths(normalized, { baseRel, repositoryRoot, packagePath })
    // Set even when undefined (QUIRK): `'base' in config.build` is always true.
    const withBase = { ...withPaths, build: { ...withPaths.build, base } }

    const headersPath = resolve(withBase.build.publish, '_headers')
    const headers = await mergeHeaders(withBase.headers, { headersPath, logs })
    const redirectsPath = resolve(withBase.build.publish, '_redirects')
    const redirects = await mergeRedirects(withBase.redirects, { redirectsPath, logs })
    // `headers` and `redirects` move to the end, which shows in the JSON output.
    const { headers: _configHeaders, redirects: _configRedirects, ...rest } = withBase
    const resolvedConfig: NetlifyConfig = { ...rest, headers, redirects }

    return { loaded: { configPath, config: resolvedConfig, buildDir, headersPath, redirectsPath }, base }
  } catch (error) {
    throw prefixError(error, `When ${getStage(configPath, configMutationsOrigin)}`)
  }
}

// An invalid value set by a mutation isn't in the file, so its origin is named instead.
const getStage = function (configPath: string | undefined, configMutationsOrigin: string | undefined): string {
  if (configMutationsOrigin !== undefined) {
    return `applying configuration from ${configMutationsOrigin}`
  }
  return configPath === undefined ? 'resolving config' : `resolving config file ${configPath}`
}

// The repository root was already checked to be a directory.
const getBuildDir = async function (base: string | undefined, repositoryRoot: string): Promise<string> {
  const buildDir = base ?? repositoryRoot
  if (buildDir !== repositoryRoot && !(await isDirectory(buildDir))) {
    throwUserError(`Base directory does not exist: ${buildDir}`)
  }
  return buildDir
}
