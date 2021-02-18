'use strict'

const { writeFile } = require('fs')
const { platform, version } = require('process')
const { promisify } = require('util')

const pluginsList = require('@netlify/plugins-list')
const test = require('ava')
const cpy = require('cpy')
const del = require('del')
const { spy } = require('sinon')

const { removeDir } = require('../helpers/dir')
const { runFixture, FIXTURES_DIR } = require('../helpers/main')
const { startServer } = require('../helpers/server')
const { startTcpServer } = require('../helpers/tcp_server')
const { getTempDir } = require('../helpers/temp')

const pWriteFile = promisify(writeFile)

test('Pass netlifyConfig to plugins', async (t) => {
  await runFixture(t, 'config_valid')
})

test('constants.CONFIG_PATH', async (t) => {
  await runFixture(t, 'config_path')
})

test('constants.PUBLISH_DIR default value', async (t) => {
  await runFixture(t, 'publish_default')
})

test('constants.PUBLISH_DIR default value with build.base', async (t) => {
  await runFixture(t, 'publish_default_base')
})

test('constants.PUBLISH_DIR absolute path', async (t) => {
  await runFixture(t, 'publish_absolute')
})

test('constants.PUBLISH_DIR relative path', async (t) => {
  await runFixture(t, 'publish_relative')
})

test('constants.PUBLISH_DIR missing path', async (t) => {
  await runFixture(t, 'publish_missing')
})

test('constants.FUNCTIONS_SRC default value', async (t) => {
  await runFixture(t, 'functions_src_default')
})

test('constants.FUNCTIONS_SRC uses legacy default functions directory, if it exists, and shows a warning', async (t) => {
  await runFixture(t, 'functions_src_legacy')
})

test('constants.FUNCTIONS_SRC ignores the legacy default functions directory if the new default directory exists', async (t) => {
  await runFixture(t, 'functions_src_default_and_legacy')
})

test('constants.FUNCTIONS_SRC relative path', async (t) => {
  await runFixture(t, 'functions_src_relative')
})

test('constants.FUNCTIONS_SRC automatic value', async (t) => {
  await runFixture(t, 'functions_src_auto')
})

test('constants.FUNCTIONS_SRC missing path', async (t) => {
  await runFixture(t, 'functions_src_missing')
})

test('constants.FUNCTIONS_SRC created dynamically', async (t) => {
  await runFixture(t, 'functions_src_dynamic', { copyRoot: { git: false } })
})

test('constants.FUNCTIONS_SRC dynamic is ignored if FUNCTIONS_SRC is specified', async (t) => {
  await runFixture(t, 'functions_src_dynamic_ignore', { copyRoot: { git: false } })
})

test('constants.FUNCTIONS_SRC dynamic should bundle Functions', async (t) => {
  await runFixture(t, 'functions_src_dynamic_bundle', { copyRoot: { git: false } })
})

test('constants.FUNCTIONS_DIST', async (t) => {
  await runFixture(t, 'functions_dist')
})

test('constants.CACHE_DIR local', async (t) => {
  await runFixture(t, 'cache')
})

test('constants.CACHE_DIR CI', async (t) => {
  await runFixture(t, 'cache', { flags: { mode: 'buildbot' } })
})

test('constants.IS_LOCAL CI', async (t) => {
  await runFixture(t, 'is_local', { flags: { mode: 'buildbot' } })
})

test('constants.SITE_ID', async (t) => {
  await runFixture(t, 'site_id', { flags: { siteId: 'test' } })
})

test('constants.IS_LOCAL local', async (t) => {
  await runFixture(t, 'is_local')
})

test('constants.NETLIFY_BUILD_VERSION', async (t) => {
  await runFixture(t, 'netlify_build_version')
})

test('constants.NETLIFY_API_TOKEN', async (t) => {
  await runFixture(t, 'netlify_api_token', { flags: { token: 'test', testOpts: { env: false } } })
})

test('Pass packageJson to plugins', async (t) => {
  await runFixture(t, 'package_json_valid')
})

test('Pass empty packageJson to plugins if no package.json', async (t) => {
  await runFixture(t, 'package_json_none', { copyRoot: { git: false } })
})

test('Pass empty packageJson to plugins if package.json invalid', async (t) => {
  await runFixture(t, 'package_json_invalid')
})

test('Functions: simple setup', async (t) => {
  await removeDir(`${FIXTURES_DIR}/simple/.netlify/functions/`)
  await runFixture(t, 'simple')
})

test('Functions: missing source directory', async (t) => {
  await runFixture(t, 'missing')
})

test('Functions: must not be a regular file', async (t) => {
  await runFixture(t, 'regular_file')
})

test('Functions: no functions', async (t) => {
  await runFixture(t, 'none')
})

test('Functions: default directory', async (t) => {
  await runFixture(t, 'default')
})

test('Functions: invalid package.json', async (t) => {
  const fixtureName = 'functions_package_json_invalid'
  const packageJsonPath = `${FIXTURES_DIR}/${fixtureName}/package.json`
  // We need to create that file during tests. Otherwise, ESLint fails when
  // detecting an invalid *.json file.
  await pWriteFile(packageJsonPath, '{{}')
  try {
    await runFixture(t, fixtureName)
  } finally {
    await del(packageJsonPath)
  }
})

test('Functions: --functionsDistDir', async (t) => {
  const functionsDistDir = await getTempDir()
  try {
    await runFixture(t, 'simple', { flags: { functionsDistDir } })
  } finally {
    await removeDir(functionsDistDir)
  }
})

const EDGE_HANDLERS_LOCAL_DIR = '.netlify/edge-handlers'
const EDGE_HANDLERS_MANIFEST = 'manifest.json'

const getEdgeHandlersPaths = function (fixtureName) {
  const outputDir = `${FIXTURES_DIR}/${fixtureName}/${EDGE_HANDLERS_LOCAL_DIR}`
  const manifestPath = `${outputDir}/${EDGE_HANDLERS_MANIFEST}`
  return { outputDir, manifestPath }
}

const loadEdgeHandlerBundle = async function ({ outputDir, manifestPath }) {
  const bundlePath = getEdgeHandlerBundlePath({ outputDir, manifestPath })

  try {
    return requireEdgeHandleBundle(bundlePath)
  } finally {
    await removeDir(bundlePath)
  }
}

const getEdgeHandlerBundlePath = function ({ outputDir, manifestPath }) {
  // eslint-disable-next-line node/global-require, import/no-dynamic-require
  const { sha } = require(manifestPath)
  return `${outputDir}/${sha}`
}

const requireEdgeHandleBundle = function (bundlePath) {
  const set = spy()
  global.netlifyRegistry = { set }
  // eslint-disable-next-line node/global-require, import/no-dynamic-require
  require(bundlePath)
  delete global.netlifyRegistry
  return set.args.map(normalizeEdgeHandler)
}

const normalizeEdgeHandler = function ([handlerName, { onRequest }]) {
  return { handlerName, onRequest }
}

// Edge handlers are not supported in Node 8
// TODO: remove once Node 8 support is removed
if (!version.startsWith('v8.')) {
  test('constants.EDGE_HANDLERS_SRC default value', async (t) => {
    await runFixture(t, 'edge_handlers_src_default')
  })

  test('constants.EDGE_HANDLERS_SRC automatic value', async (t) => {
    await runFixture(t, 'edge_handlers_src_auto')
  })

  test('constants.EDGE_HANDLERS_SRC relative path', async (t) => {
    await runFixture(t, 'edge_handlers_src_relative')
  })

  test('constants.EDGE_HANDLERS_SRC missing path', async (t) => {
    await runFixture(t, 'edge_handlers_src_missing')
  })

  test('constants.EDGE_HANDLERS_SRC created dynamically', async (t) => {
    await runFixture(t, 'edge_handlers_src_dynamic', { copyRoot: { git: false } })
  })

  test('constants.EDGE_HANDLERS_SRC dynamic is ignored if EDGE_HANDLERS_SRC is specified', async (t) => {
    await runFixture(t, 'edge_handlers_src_dynamic_ignore', { copyRoot: { git: false } })
  })

  test('Edge handlers: simple setup', async (t) => {
    const { outputDir, manifestPath } = getEdgeHandlersPaths('handlers_simple')
    await runFixture(t, 'handlers_simple')

    const [{ handlerName, onRequest }] = await loadEdgeHandlerBundle({ outputDir, manifestPath })
    t.is(handlerName, 'test')
    t.deepEqual(onRequest('test'), [true, 'test', 'test'])
  })

  test('Edge handlers: can configure directory', async (t) => {
    const { outputDir, manifestPath } = getEdgeHandlersPaths('handlers_custom_dir')
    await runFixture(t, 'handlers_custom_dir')

    const [{ handlerName }] = await loadEdgeHandlerBundle({ outputDir, manifestPath })
    t.is(handlerName, 'test')
  })
}

test('Deploy plugin succeeds', async (t) => {
  const { address, requests, stopServer } = await startDeployServer()
  try {
    await runFixture(t, 'empty', { flags: { buildbotServerSocket: address } })
  } finally {
    await stopServer()
  }

  t.true(requests.every(isValidDeployReponse))
})

test('Deploy plugin is not run unless --buildbotServerSocket is passed', async (t) => {
  const { requests, stopServer } = await startDeployServer()
  try {
    await runFixture(t, 'empty', { flags: {}, snapshot: false })
  } finally {
    await stopServer()
  }

  t.is(requests.length, 0)
})

test('Deploy plugin connection error', async (t) => {
  const { address, stopServer } = await startDeployServer()
  await stopServer()
  const { exitCode, returnValue } = await runFixture(t, 'empty', {
    flags: { buildbotServerSocket: address },
    snapshot: false,
  })
  t.not(exitCode, 0)
  t.true(returnValue.includes('Could not connect to buildbot: Error: connect'))
})

test('Deploy plugin response syntax error', async (t) => {
  const { address, stopServer } = await startDeployServer({ response: 'test' })
  try {
    await runFixture(t, 'empty', { flags: { buildbotServerSocket: address } })
  } finally {
    await stopServer()
  }
})

test('Deploy plugin response system error', async (t) => {
  const { address, stopServer } = await startDeployServer({
    response: { succeeded: false, values: { error: 'test', error_type: 'system' } },
  })
  try {
    await runFixture(t, 'empty', { flags: { buildbotServerSocket: address } })
  } finally {
    await stopServer()
  }
})

test('Deploy plugin response user error', async (t) => {
  const { address, stopServer } = await startDeployServer({
    response: { succeeded: false, values: { error: 'test', error_type: 'user' } },
  })
  try {
    await runFixture(t, 'empty', { flags: { buildbotServerSocket: address } })
  } finally {
    await stopServer()
  }
})

test('Deploy plugin does not wait for post-processing if not using onSuccess nor onEnd', async (t) => {
  const { address, requests, stopServer } = await startDeployServer()
  try {
    await runFixture(t, 'empty', { flags: { buildbotServerSocket: address }, snapshot: false })
  } finally {
    await stopServer()
  }

  t.true(requests.every(doesNotWaitForPostProcessing))
})

test('Deploy plugin waits for post-processing if using onSuccess', async (t) => {
  const { address, requests, stopServer } = await startDeployServer()
  try {
    await runFixture(t, 'success', { flags: { buildbotServerSocket: address }, snapshot: false })
  } finally {
    await stopServer()
  }

  t.true(requests.every(waitsForPostProcessing))
})

test('Deploy plugin waits for post-processing if using onEnd', async (t) => {
  const { address, requests, stopServer } = await startDeployServer()
  try {
    await runFixture(t, 'end', { flags: { buildbotServerSocket: address }, snapshot: false })
  } finally {
    await stopServer()
  }

  t.true(requests.every(waitsForPostProcessing))
})

const startDeployServer = function (opts = {}) {
  const useUnixSocket = platform !== 'win32'
  return startTcpServer({ useUnixSocket, response: { succeeded: true, ...opts.response }, ...opts })
}

const isValidDeployReponse = function (request) {
  return ['deploySite', 'deploySiteAndAwaitLive'].includes(request.action)
}

const doesNotWaitForPostProcessing = function (request) {
  return request.action === 'deploySite'
}

const waitsForPostProcessing = function (request) {
  return request.action === 'deploySiteAndAwaitLive'
}

test('DPC plugin is not used on other contexts', async (t) => {
  await runFixture(t, 'empty', { flags: { featureFlags: 'dpc' } })
})

test('DPC plugin is only used if the feature flag is enabled', async (t) => {
  await runFixture(t, 'empty', { env: { CONTEXT: 'deploy-preview' } })
})

test('DPC plugin shows a URL as a plugin status', async (t) => {
  await runFixture(t, 'empty', { flags: { featureFlags: 'dpc' }, env: { CONTEXT: 'deploy-preview' } })
})

test('DPC plugin should modify netlify.toml headers', async (t) => {
  await runFixture(t, 'dpc_headers_toml', {
    flags: { featureFlags: 'dpc' },
    env: { CONTEXT: 'deploy-preview' },
    copyRoot: { git: false },
  })
})

test('DPC plugin should modify headers file', async (t) => {
  await runFixture(t, 'dpc_headers_file', {
    flags: { featureFlags: 'dpc' },
    env: { CONTEXT: 'deploy-preview' },
    copyRoot: { git: false },
  })
})

test('DPC plugin should inject HTML', async (t) => {
  await runFixture(t, 'dpc_inject_html', {
    flags: { featureFlags: 'dpc' },
    env: { CONTEXT: 'deploy-preview' },
    copyRoot: { git: false },
  })
})

test('DPC plugin works without a netlify.toml', async (t) => {
  await runFixture(t, 'no_config', {
    flags: { featureFlags: 'dpc' },
    env: { CONTEXT: 'deploy-preview' },
    copyRoot: { git: false },
  })
})

test('plugin.onSuccess is triggered on success', async (t) => {
  await runFixture(t, 'success_ok')
})

test('plugin.onSuccess is not triggered on failure', async (t) => {
  await runFixture(t, 'success_not_ok')
})

test('plugin.onSuccess is not triggered on failPlugin()', async (t) => {
  await runFixture(t, 'success_fail_plugin')
})

test('plugin.onSuccess is not triggered on cancelBuild()', async (t) => {
  await runFixture(t, 'success_cancel_build')
})

test('plugin.onSuccess can fail but does not stop builds', async (t) => {
  await runFixture(t, 'success_fail')
})

test('plugin.onError is not triggered on success', async (t) => {
  await runFixture(t, 'error_ok')
})

test('plugin.onError is triggered on failure', async (t) => {
  await runFixture(t, 'error_not_ok')
})

test('plugin.onError is not triggered on failPlugin()', async (t) => {
  await runFixture(t, 'error_fail_plugin')
})

test('plugin.onError is triggered on cancelBuild()', async (t) => {
  await runFixture(t, 'error_cancel_build')
})

test('plugin.onError can fail', async (t) => {
  await runFixture(t, 'error_fail')
})

test('plugin.onError gets an error argument', async (t) => {
  await runFixture(t, 'error_argument')
})

test('plugin.onError can be used in several plugins', async (t) => {
  await runFixture(t, 'error_several')
})

test('plugin.onEnd is triggered on success', async (t) => {
  await runFixture(t, 'end_ok')
})

test('plugin.onEnd is triggered on failure', async (t) => {
  await runFixture(t, 'end_not_ok')
})

test('plugin.onEnd is not triggered on failPlugin()', async (t) => {
  await runFixture(t, 'end_fail_plugin')
})

test('plugin.onEnd is triggered on cancelBuild()', async (t) => {
  await runFixture(t, 'end_cancel_build')
})

test('plugin.onEnd can fail but it does not stop builds', async (t) => {
  await runFixture(t, 'end_fail')
})

test('plugin.onEnd and plugin.onError can be used together', async (t) => {
  await runFixture(t, 'end_error')
})

test('plugin.onEnd can be used in several plugins', async (t) => {
  await runFixture(t, 'end_several')
})

test('Local plugins', async (t) => {
  await runFixture(t, 'local')
})

test('Local plugins directory', async (t) => {
  await runFixture(t, 'local_dir')
})

test('Local plugins absolute path', async (t) => {
  await runFixture(t, 'local_absolute')
})

test('Local plugins invalid path', async (t) => {
  await runFixture(t, 'local_invalid')
})

test('Node module plugins', async (t) => {
  await runFixture(t, 'module')
})

test('UI plugins', async (t) => {
  const defaultConfig = JSON.stringify({ plugins: [{ package: 'netlify-plugin-test' }] })
  await runFixture(t, 'ui', { flags: { defaultConfig } })
})

test('Resolution is relative to the build directory', async (t) => {
  await runFixture(t, 'module_base', { flags: { config: `${FIXTURES_DIR}/module_base/netlify.toml` } })
})

test('Non-existing plugins', async (t) => {
  await runFixture(t, 'non_existing')
})

test('Do not allow overriding core plugins', async (t) => {
  await runFixture(t, 'core_override')
})

const runWithApiMock = async function (t, fixtureName, flags = {}, status = 200) {
  const { scheme, host, stopServer } = await startServer({
    path: PLUGINS_LIST_URL,
    response: PLUGINS_LIST_DATA,
    status,
  })
  try {
    await runFixture(t, fixtureName, {
      flags: {
        testOpts: { pluginsListUrl: `${scheme}://${host}`, ...flags.testOpts },
        ...flags,
      },
    })
  } finally {
    await stopServer()
  }
}

// We use a specific plugin in tests. We hardcode its version to keep the tests
// stable even when new versions of that plugin are published.
const getPluginsList = function () {
  return pluginsList.map(getPlugin)
}

const getPlugin = function (plugin) {
  if (plugin.package !== TEST_PLUGIN_NAME) {
    return plugin
  }

  return { ...plugin, version: '0.3.0' }
}

const TEST_PLUGIN_NAME = 'netlify-plugin-contextual-env'

const PLUGINS_LIST_URL = '/'
const PLUGINS_LIST_DATA = getPluginsList()

test('Install plugins in .netlify/plugins/ when not cached', async (t) => {
  await removeDir(`${FIXTURES_DIR}/valid_package/.netlify`)
  try {
    await runWithApiMock(t, 'valid_package')
  } finally {
    await removeDir(`${FIXTURES_DIR}/valid_package/.netlify`)
  }
})

test('Use plugins cached in .netlify/plugins/', async (t) => {
  await runWithApiMock(t, 'plugins_cache')
})

test('Do not use plugins cached in .netlify/plugins/ if outdated', async (t) => {
  const pluginsDir = `${FIXTURES_DIR}/plugins_cache_outdated/.netlify/plugins`
  await removeDir(pluginsDir)
  await cpy('**', '../plugins', { cwd: `${pluginsDir}-old`, parents: true })
  try {
    await runWithApiMock(t, 'plugins_cache_outdated')
  } finally {
    await removeDir(pluginsDir)
  }
})

test('Fetches the list of plugin versions', async (t) => {
  await runWithApiMock(t, 'plugins_cache')
})

test('Only prints the list of plugin versions in verbose mode', async (t) => {
  await runWithApiMock(t, 'plugins_cache', { debug: false })
})

test('Uses fallback when the plugins fetch fails', async (t) => {
  await runWithApiMock(t, 'plugins_cache', {}, 500)
})

test('Can execute local binaries when using .netlify/plugins/', async (t) => {
  await runWithApiMock(t, 'plugins_cache_bin')
})

test('Can require site dependencies when using .netlify/plugins/', async (t) => {
  await runWithApiMock(t, 'plugins_cache_site_deps')
})

test('Works with .netlify being a regular file', async (t) => {
  const dotNetlifyFile = `${FIXTURES_DIR}/plugins_cache_regular_file/.netlify`
  await pWriteFile(dotNetlifyFile, '')
  try {
    await runWithApiMock(t, 'plugins_cache_regular_file')
  } finally {
    await removeDir(dotNetlifyFile)
  }
})

test('Print a warning when using plugins not in plugins.json nor package.json', async (t) => {
  await runWithApiMock(t, 'invalid_package')
})

test('Can use local plugins even when some plugins are cached', async (t) => {
  await runWithApiMock(t, 'plugins_cache_local')
})

test('Prints outdated plugins installed in package.json', async (t) => {
  await runWithApiMock(t, 'plugins_outdated_package_json')
})

const getNodePath = function (nodeVersion) {
  return `/home/ether/.nvm/versions/node/v${nodeVersion}/bin/node`
}

test('Validate --node-path version is supported by our codebase', async (t) => {
  const nodePath = getNodePath('8.2.0')
  await runFixture(t, 'node_version_simple', { flags: { nodePath } })
})

test('Validate --node-path unsupported version does not fail when no plugins are used', async (t) => {
  const nodePath = getNodePath('8.2.0')
  await runFixture(t, 'empty', { flags: { nodePath } })
})

test('Validate --node-path version is supported by the plugin', async (t) => {
  const nodePath = getNodePath('9.0.0')
  await runFixture(t, 'engines', { flags: { nodePath } })
})

test('Validate --node-path', async (t) => {
  await runFixture(t, 'node_version_simple', { flags: { nodePath: '/doesNotExist' } })
})

test('Plugins can execute local binaries', async (t) => {
  await runFixture(t, 'local_bin')
})

test('Plugin output can interleave stdout and stderr', async (t) => {
  await runFixture(t, 'interleave')
})

// TODO: check output length once big outputs are actually fixed
test.serial('Big plugin output is not truncated', async (t) => {
  await runFixture(t, 'big', { snapshot: false })
  t.pass()
})

test('Plugins can have inputs', async (t) => {
  await runFixture(t, 'inputs')
})

test('process.env changes are propagated to other plugins', async (t) => {
  await runFixture(t, 'env_changes_plugin')
})

test('process.env changes are propagated to onError and onEnd', async (t) => {
  await runFixture(t, 'env_changes_on_error')
})

test('process.env changes are propagated to build.command', async (t) => {
  await runFixture(t, 'env_changes_command')
})

test('Expose some utils', async (t) => {
  await runFixture(t, 'keys')
})

test('Utils are defined', async (t) => {
  await runFixture(t, 'defined')
})

test('Can run utils', async (t) => {
  await removeDir(`${FIXTURES_DIR}/functions/functions`)
  await runFixture(t, 'functions')
  await removeDir(`${FIXTURES_DIR}/functions/functions`)
})

test('Git utils fails if no root', async (t) => {
  await runFixture(t, 'git_no_root', { copyRoot: { git: false } })
})

test('Git utils does not fail if no root and not used', async (t) => {
  await runFixture(t, 'keys', { copyRoot: { git: false } })
})

test('Validate plugin is an object', async (t) => {
  await runFixture(t, 'object')
})

test('Validate plugin event handler names', async (t) => {
  await runFixture(t, 'handler_name')
})

test('Validate plugin event handler function', async (t) => {
  await runFixture(t, 'handler_function')
})
