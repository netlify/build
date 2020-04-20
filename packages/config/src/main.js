require('./utils/polyfills')

const {
  env: { NETLIFY_AUTH_TOKEN },
} = require('process')

const { addBuildSettings } = require('./api/build_settings')
const { getApiClient } = require('./api/client')
const { getSiteInfo } = require('./api/site_info')
const { mergeContext } = require('./context')
const { throwError } = require('./error')
const { handleFiles } = require('./files')
const { EVENTS, LEGACY_EVENTS } = require('./normalize/events')
const { normalizeConfig } = require('./normalize/main')
const { normalizeOpts } = require('./options/main')
const { parseConfig } = require('./parse/main')
const { getConfigPath } = require('./path')
const { deepMerge } = require('./utils/merge')
const { omit } = require('./utils/omit')
const { validateConfig } = require('./validate/main')

// Load the configuration file.
// Takes an optional configuration file path as input and return the resolved
// `config` together with related properties such as the `configPath`.
const resolveConfig = async function({ cachedConfig, token = NETLIFY_AUTH_TOKEN, siteId, ...opts } = {}) {
  // `api` is not JSON-serializable, so we cannot cache it inside `cachedConfig`
  const api = getApiClient(token)

  // Performance optimization when @netlify/config caller has already previously
  // called it and cached the result.
  // This is used by the buildbot which:
  //  - first calls @netlify/config since it needs configuration property
  //  - later calls @netlify/build, which runs @netlify/config under the hood
  if (cachedConfig !== undefined) {
    return { ...getConfig(cachedConfig, 'cached'), api }
  }

  const {
    config: configOpt,
    defaultConfig,
    cwd,
    context,
    repositoryRoot,
    branch,
    baseRelDir,
    mode,
  } = await normalizeOpts(opts)

  const defaultConfigA = getDefaultConfig(defaultConfig, mode)

  const siteInfo = await getSiteInfo(api, siteId, mode)
  const { defaultConfig: defaultConfigB, baseRelDir: baseRelDirA = DEFAULT_BASE_REL_DIR } = addBuildSettings({
    defaultConfig: defaultConfigA,
    baseRelDir,
    siteInfo,
  })

  const { configPath, config } = await loadConfig({
    configOpt,
    cwd,
    context,
    repositoryRoot,
    branch,
    defaultConfig: defaultConfigB,
    baseRelDir: baseRelDirA,
  })

  const { config: configA, buildDir } = await handleFiles({ config, repositoryRoot, baseRelDir: baseRelDirA })

  return { siteInfo, configPath, buildDir, config: configA, context, branch, api }
}

// `baseRelDir` should default to `true` only if the option was not passed and
// it could be retrieved from the `siteInfo`, which is why the default value
// is assigned later than other properties.
const DEFAULT_BASE_REL_DIR = true

// Retrieve default configuration file. It has less priority and it also does
// not get normalized, merged with contexts, etc.
const getDefaultConfig = function(defaultConfig, mode) {
  const defaultConfigA = getConfig(defaultConfig, 'default')
  const defaultConfigB = mode === 'buildbot' ? removeBuildbotEnv(defaultConfigA) : defaultConfigA
  return defaultConfigB
}

// The buildbot pass some environment variables both in `@netlify/config` and
// as `process.env`. We remove the first one since it's redundant and make the
// `@netlify/config` bigger.
const removeBuildbotEnv = function({ build: { environment = {}, ...build } = {}, ...defaultConfig }) {
  const environmentA = omit(environment, BUILDBOT_ENV)
  return { ...defaultConfig, build: { ...build, environment: environmentA } }
}

const BUILDBOT_ENV = [
  'BRANCH',
  'CONTEXT',
  'DEPLOY_PRIME_URL',
  'DEPLOY_URL',
  'GO_VERSION',
  'NETLIFY_IMAGES_CDN_DOMAIN',
  'URL',
]

// Load a configuration file passed as a JSON object.
// The logic is much simpler: it does not normalize nor validate it.
const getConfig = function(config, name) {
  if (config === undefined) {
    return {}
  }

  try {
    return JSON.parse(config)
  } catch (error) {
    throwError(`When resolving ${name} configuration`, error)
  }
}

// Try to load the configuration file in two passes.
// The first pass uses the `defaultConfig`'s `build.base` (if defined).
// The second pass uses the `build.base` from the first pass (if defined).
const loadConfig = async function({
  configOpt,
  cwd,
  context,
  repositoryRoot,
  branch,
  defaultConfig,
  defaultConfig: { build: { base: defaultBase } = {} },
  baseRelDir,
}) {
  const {
    configPath,
    config,
    config: {
      build: { base },
    },
  } = await getFullConfig({ configOpt, cwd, context, repositoryRoot, branch, defaultConfig, base: defaultBase })

  // No second pass needed if:
  //  - there is no `build.base`
  //  - `build.base` is the same as the `Base directory` UI setting (already used in the first round)
  //  - `baseRelDir` feature flag is not used. This feature flag was introduced to ensure
  //    backward compatibility.
  if (!baseRelDir || base === undefined || base === defaultBase) {
    return { configPath, config }
  }

  const { configPath: configPathA, config: configA } = await getFullConfig({
    cwd,
    context,
    repositoryRoot,
    branch,
    defaultConfig,
    base,
  })

  // Since we don't recurse anymore, we keep the original `build.base` that was used
  const configB = { ...configA, build: { ...configA.build, base } }

  return { configPath: configPathA, config: configB }
}

// Load configuration file and normalize it, merge contexts, etc.
const getFullConfig = async function({ configOpt, cwd, context, repositoryRoot, branch, defaultConfig, base }) {
  const configPath = await getConfigPath({ configOpt, cwd, repositoryRoot, base })

  try {
    const config = await parseConfig(configPath)
    const configA = deepMerge(defaultConfig, config)

    validateConfig(configA)

    const configB = mergeContext(configA, context, branch)
    const configC = normalizeConfig(configB)
    return { configPath, config: configC }
  } catch (error) {
    error.message = `When resolving config file ${configPath}:\n${error.message}`
    throw error
  }
}

module.exports = resolveConfig
module.exports.EVENTS = EVENTS
module.exports.LEGACY_EVENTS = LEGACY_EVENTS
