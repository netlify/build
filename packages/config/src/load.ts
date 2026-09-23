import { addBase, getBase, getInitialBase } from './base.js'
import { getBuildDir } from './build_dir.js'
import { mergeContext, normalizeContextProps } from './context.js'
import { resolveConfigPaths } from './files.js'
import { addHeaders, getHeadersPath } from './headers.js'
import { mergeConfigs } from './merge.js'
import { normalizeAfterConfigMerge, normalizeBeforeConfigMerge } from './merge_normalize.js'
import { CONFIG_ORIGIN, INLINE_ORIGIN, UI_ORIGIN } from './origin.js'
import { parseConfig } from './parse.js'
import { getConfigPath } from './path.js'
import { addRedirects, getRedirectsPath } from './redirects.js'
import type {
  ConfigOrigin,
  NormalizedNetlifyConfig,
  PartialNetlifyConfig,
  ResolvedNetlifyConfig,
} from './types/config.js'
import type { Logs } from './types/logs.js'

type LoadConfigOptions = {
  /** The `config` option: a path to the configuration file. */
  configOpt: string | undefined
  cwd: string
  context: string
  repositoryRoot: string
  packagePath: string | undefined
  branch: string
  defaultConfig: PartialNetlifyConfig
  inlineConfig: PartialNetlifyConfig
  /** Where the config mutations come from, for error messages. */
  configMutationsOrigin: string | undefined
  baseRelDir: boolean
  logs: Logs | undefined
}

export type LoadedConfig = {
  configPath: string | undefined
  config: ResolvedNetlifyConfig
  buildDir: string
  headersPath: string
  redirectsPath: string
}

/**
 * Load the configuration file, merge it with the other sources, and resolve it.
 *
 * If the resulting `build.base` is a different directory than the one used to find the
 * configuration file, the configuration is loaded a second time from that directory, whose
 * `netlify.toml` may differ. This only happens with `baseRelDir`, which exists for backward
 * compatibility. The second pass doesn't use the `config` option or `packagePath`.
 */
export const loadConfig = async function ({
  configOpt,
  packagePath,
  ...options
}: LoadConfigOptions): Promise<LoadedConfig> {
  const initialBase = getInitialBase(options)
  const { base, ...firstPass } = await loadConfigOnce({ ...options, configOpt, packagePath, configBase: initialBase })

  if (!options.baseRelDir || base === initialBase) {
    return firstPass
  }

  const { base: _secondBase, ...secondPass } = await loadConfigOnce({ ...options, configBase: base, base })
  return secondPass
}

type LoadConfigOnceOptions = Omit<LoadConfigOptions, 'configOpt' | 'packagePath'> & {
  configOpt?: string
  packagePath?: string
  /** The base directory to look for the configuration file in. */
  configBase: string | undefined
  /** The base directory, if already known. Otherwise it comes from the configuration. */
  base?: string
}

const loadConfigOnce = async function ({
  configOpt,
  cwd,
  context,
  repositoryRoot,
  packagePath,
  branch,
  defaultConfig,
  inlineConfig,
  configMutationsOrigin,
  baseRelDir,
  configBase,
  base,
  logs,
}: LoadConfigOnceOptions): Promise<LoadedConfig & { base: string | undefined }> {
  const configPath = await getConfigPath({ configOpt, cwd, repositoryRoot, packagePath, configBase })
  try {
    const fileConfig = await parseConfig(configPath)
    const mergedConfig = mergeAndNormalizeConfig({
      fileConfig,
      defaultConfig,
      inlineConfig,
      context,
      branch,
      logs,
      packagePath,
    })
    const {
      config: resolvedConfig,
      buildDir,
      base: resolvedBase,
    } = await resolveFiles({ config: mergedConfig, repositoryRoot, base, packagePath, baseRelDir })
    const headersPath = getHeadersPath(resolvedConfig)
    const withHeaders = await addHeaders({ config: resolvedConfig, headersPath, logs })
    const redirectsPath = getRedirectsPath(withHeaders)
    const withRedirects = await addRedirects({ config: withHeaders, redirectsPath, logs })
    return { configPath, config: withRedirects, buildDir, base: resolvedBase, headersPath, redirectsPath }
  } catch (error) {
    throw addErrorStage(error, configPath, configMutationsOrigin)
  }
}

// An invalid value set by a config mutation isn't in the configuration file.
const addErrorStage = function (
  error: unknown,
  configPath: string | undefined,
  configMutationsOrigin: string | undefined,
) {
  if (!(error instanceof Error)) {
    return error
  }

  const configName = configPath === undefined ? '' : ` file ${configPath}`
  const stage =
    configMutationsOrigin === undefined
      ? `resolving config${configName}`
      : `applying configuration from ${configMutationsOrigin}`
  error.message = `When ${stage}:\n${error.message}`
  return error
}

type MergeAndNormalizeOptions = {
  fileConfig: PartialNetlifyConfig
  defaultConfig: PartialNetlifyConfig
  inlineConfig: PartialNetlifyConfig
  context: string
  branch: string
  logs: Logs | undefined
  packagePath: string | undefined
}

/**
 * Merge, in increasing priority, `defaultConfig` (UI build settings and plugins), the
 * configuration file, the matching contexts, and `inlineConfig` (for example netlify-cli flags).
 * Each source is validated and normalized before merging, and the result after.
 */
const mergeAndNormalizeConfig = function ({
  fileConfig,
  defaultConfig,
  inlineConfig,
  context,
  branch,
  logs,
  packagePath,
}: MergeAndNormalizeOptions): NormalizedNetlifyConfig {
  const normalizedFileConfig = normalizeSource(fileConfig, CONFIG_ORIGIN)
  const normalizedDefaultConfig = normalizeSource(defaultConfig, UI_ORIGIN)
  const normalizedInlineConfig = normalizeSource(inlineConfig, INLINE_ORIGIN)

  const withDefaults = mergeConfigs([normalizedDefaultConfig, normalizedFileConfig])
  const withContexts = mergeContext({ config: withDefaults, context, branch, logs })
  const withInlineConfig = mergeConfigs([withContexts, normalizedInlineConfig])

  return normalizeAfterConfigMerge(withInlineConfig, packagePath)
}

const normalizeSource = function (config: PartialNetlifyConfig, origin: ConfigOrigin) {
  return normalizeContextProps(normalizeBeforeConfigMerge(config, origin), origin)
}

type ResolveFilesOptions = {
  config: NormalizedNetlifyConfig
  repositoryRoot: string
  base: string | undefined
  packagePath: string | undefined
  baseRelDir: boolean
}

/** Find the base and build directories, and make every path absolute. */
const resolveFiles = async function ({ config, repositoryRoot, base, packagePath, baseRelDir }: ResolveFilesOptions) {
  const resolvedBase = getBase(base, repositoryRoot, config)
  const buildDir = await getBuildDir(repositoryRoot, resolvedBase)
  const withPaths = resolveConfigPaths({ config, packagePath, repositoryRoot, buildDir, baseRelDir })
  return { config: addBase(withPaths, resolvedBase), buildDir, base: resolvedBase }
}
