'use strict'

const { writeFile } = require('fs')
const { normalize } = require('path')
const { platform, version } = require('process')
const { promisify } = require('util')

const { pluginsList } = require('@netlify/plugins-list')
const test = require('ava')
const cpFile = require('cp-file')
const cpy = require('cpy')
const del = require('del')
const pathExists = require('path-exists')
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

test('netlifyConfig properties are readonly (set) by default', async (t) => {
  await runFixture(t, 'config_readonly_set')
})

test('netlifyConfig properties are readonly (delete) by default', async (t) => {
  await runFixture(t, 'config_readonly_delete')
})

test('netlifyConfig properties are readonly (defineProperty) by default', async (t) => {
  await runFixture(t, 'config_readonly_define')
})

// This package currently supports Node 8 but not zip-it-and-ship-it
// @todo remove once Node 8 support is removed
if (!version.startsWith('v8.')) {
  test('Some netlifyConfig properties can be mutated', async (t) => {
    await runFixture(t, 'config_mutate_general')
  })

  test('netlifyConfig properties cannot be deleted', async (t) => {
    await runFixture(t, 'config_mutate_delete')
  })

  test('netlifyConfig properties cannot be assigned to undefined', async (t) => {
    await runFixture(t, 'config_mutate_set_undefined')
  })

  test('netlifyConfig properties cannot be assigned to null', async (t) => {
    await runFixture(t, 'config_mutate_set_null')
  })

  test('netlifyConfig properties cannot be assigned to undefined with defineProperty', async (t) => {
    await runFixture(t, 'config_mutate_define_undefined')
  })

  test('netlifyConfig properties mutations is persisted', async (t) => {
    await runFixture(t, 'config_mutate_persist')
  })

  test('netlifyConfig array properties can be mutated per index', async (t) => {
    await runFixture(t, 'config_mutate_array_index')
  })

  test('netlifyConfig array properties can be pushed', async (t) => {
    await runFixture(t, 'config_mutate_array_push')
  })

  test('netlifyConfig.functionsDirectory mutations are used during functions bundling', async (t) => {
    await runFixture(t, 'config_mutate_functions_directory_bundling')
  })

  test('netlifyConfig.functionsDirectory deletion skips functions bundling', async (t) => {
    await runFixture(t, 'config_mutate_functions_directory_skip')
  })

  test('netlifyConfig.functionsDirectory mutations are used by utils.functions', async (t) => {
    await runFixture(t, 'config_mutate_functions_directory_utils')
  })

  test('netlifyConfig.functionsDirectory mutations are used by constants.FUNCTIONS_SRC', async (t) => {
    await runFixture(t, 'config_mutate_functions_directory_constants')
  })

  test('netlifyConfig.functionsDirectory mutations are taken into account by default constants.FUNCTIONS_SRC', async (t) => {
    await runFixture(t, 'config_mutate_functions_directory_default')
  })

  test('netlifyConfig.functions.star.directory mutations work', async (t) => {
    await runFixture(t, 'config_mutate_functions_directory_star')
  })

  test('netlifyConfig.functions.star.directory has priority over functions.directory', async (t) => {
    await runFixture(t, 'config_mutate_functions_directory_star_priority')
  })

  test('netlifyConfig.functions.directory mutations work', async (t) => {
    await runFixture(t, 'config_mutate_functions_directory_nested')
  })

  test('netlifyConfig.functions.directory has priority over functions.star.directory', async (t) => {
    await runFixture(t, 'config_mutate_functions_directory_nested_priority')
  })

  test('netlifyConfig.build.functions mutations work', async (t) => {
    await runFixture(t, 'config_mutate_functions_directory_build')
  })

  test('netlifyConfig.functions mutations are used during functions bundling', async (t) => {
    await runFixture(t, 'config_mutate_functions_bundling')
  })

  test('netlifyConfig.functions mutations on any property can be used', async (t) => {
    await runFixture(t, 'config_mutate_functions_any')
  })

  test('netlifyConfig.functions mutations can add new functions configs', async (t) => {
    await runFixture(t, 'config_mutate_functions_new')
  })
}

// Node 10 prints different snapshots due to change of behavior with
// `util.inspect()`
// @todo remove once Node 10 support is removed
if (!version.startsWith('v10.')) {
  test('netlifyConfig properties are deeply readonly by default', async (t) => {
    await runFixture(t, 'config_readonly_deep')
  })

  test('netlifyConfig is updated when redirects file is created by a plugin', async (t) => {
    const redirectsFile = `${FIXTURES_DIR}/config_create_redirects_plugin/_redirects`
    await del(redirectsFile)
    try {
      await runFixture(t, 'config_create_redirects_plugin')
    } finally {
      await del(redirectsFile)
    }
  })

  test('netlifyConfig is updated when redirects file is created by a plugin and publish was changed', async (t) => {
    const redirectsFile = `${FIXTURES_DIR}/config_create_redirects_plugin_dynamic/test/_redirects`
    await del(redirectsFile)
    try {
      await runFixture(t, 'config_create_redirects_plugin_dynamic')
    } finally {
      await del(redirectsFile)
    }
  })

  test('netlifyConfig is updated when redirects file is created by a build command', async (t) => {
    const redirectsFile = `${FIXTURES_DIR}/config_create_redirects_command/_redirects`
    await del(redirectsFile)
    try {
      await runFixture(t, 'config_create_redirects_command')
    } finally {
      await del(redirectsFile)
    }
  })

  test('netlifyConfig is updated when redirects file is created by a build command and publish was changed', async (t) => {
    const redirectsFile = `${FIXTURES_DIR}/config_create_redirects_command_dynamic/test/_redirects`
    await del(redirectsFile)
    try {
      await runFixture(t, 'config_create_redirects_command_dynamic')
    } finally {
      await del(redirectsFile)
    }
  })

  test('netlifyConfig.processing can be assigned all at once', async (t) => {
    await runFixture(t, 'config_mutate_processing_all')
  })

  test('netlifyConfig.processing can be assigned individually', async (t) => {
    await runFixture(t, 'config_mutate_processing_prop')
  })

  test('netlifyConfig.redirects can be assigned all at once', async (t) => {
    await runFixture(t, 'config_mutate_redirects_all')
  })

  test('netlifyConfig.redirects can be modified before redirects file has been added', async (t) => {
    const redirectsPath = `${FIXTURES_DIR}/config_mutate_redirects_before/_redirects`
    await del(redirectsPath)
    try {
      await runFixture(t, 'config_mutate_redirects_before')
    } finally {
      await del(redirectsPath)
    }
  })

  test('netlifyConfig.redirects can be modified after redirects file has been added', async (t) => {
    await runFixture(t, 'config_mutate_redirects_after')
  })

  test('--saveConfig deletes redirects file if redirects were changed', async (t) => {
    const fixtureDir = `${FIXTURES_DIR}/config_save_redirects`
    const fixtureConfigPath = `${fixtureDir}/netlify.toml`
    const configPath = `${fixtureDir}/test_netlify.toml`
    const fixtureRedirectsPath = `${fixtureDir}/_redirects_file`
    const redirectsPath = `${fixtureDir}/_redirects`
    await Promise.all([cpFile(fixtureConfigPath, configPath), cpFile(fixtureRedirectsPath, redirectsPath)])
    const { address, stopServer } = await startDeployServer()
    try {
      try {
        await runFixture(t, 'config_save_redirects', {
          flags: {
            buildbotServerSocket: address,
            config: configPath,
            saveConfig: true,
            context: 'production',
            branch: 'main',
          },
        })
      } finally {
        await stopServer()
      }
    } finally {
      await del(redirectsPath)
    }
  })
}

test('netlifyConfig.build.command can be changed', async (t) => {
  await runFixture(t, 'config_mutate_build_command_change')
})

test('netlifyConfig.build.command can be added', async (t) => {
  await runFixture(t, 'config_mutate_build_command_add')
})

test('netlifyConfig.build.command can be removed', async (t) => {
  await runFixture(t, 'config_mutate_build_command_remove')
})

test('netlifyConfig.build.environment can be assigned all at once', async (t) => {
  await runFixture(t, 'config_mutate_env_all')
})

test('netlifyConfig.build.environment can be assigned individually', async (t) => {
  await runFixture(t, 'config_mutate_env_prop')
})

test('netlifyConfig.build.publish mutations are used by constants.PUBLISH_DIR', async (t) => {
  await runFixture(t, 'config_mutate_publish_constants')
})

test('netlifyConfig.build.edge_handlers mutations are used by constants.EDGE_HANDLERS_SRC', async (t) => {
  await runFixture(t, 'config_mutate_edge_handlers_constants')
})

test('netlifyConfig.edge_handlers can be assigned all at once', async (t) => {
  await runFixture(t, 'config_mutate_edge_handlers_all')
})

test('netlifyConfig.services can be assigned all at once', async (t) => {
  await runFixture(t, 'config_mutate_services_all')
})

test('netlifyConfig.services can be assigned individually', async (t) => {
  await runFixture(t, 'config_mutate_services_prop')
})

test('netlifyConfig mutations fail if done in an event that is too late', async (t) => {
  await runFixture(t, 'config_mutate_too_late')
})

test('netlifyConfig mutations fail correctly on symbols', async (t) => {
  await runFixture(t, 'config_mutate_symbol')
})

test('--saveConfig saves the configuration changes as netlify.toml', async (t) => {
  const fixtureDir = `${FIXTURES_DIR}/config_save_changes`
  const fixtureConfigPath = `${fixtureDir}/netlify.toml`
  const configPath = `${fixtureDir}/test_netlify.toml`
  await cpFile(fixtureConfigPath, configPath)
  const { address, stopServer } = await startDeployServer()
  try {
    await runFixture(t, 'config_save_changes', {
      flags: {
        buildbotServerSocket: address,
        config: configPath,
        saveConfig: true,
        context: 'production',
        branch: 'main',
      },
    })
  } finally {
    await stopServer()
  }
})

test('--saveConfig is required to save the configuration changes as netlify.toml', async (t) => {
  const fixtureDir = `${FIXTURES_DIR}/config_save_none`
  const fixtureConfigPath = `${fixtureDir}/netlify.toml`
  const configPath = `${fixtureDir}/test_netlify.toml`
  await cpFile(fixtureConfigPath, configPath)
  const { address, stopServer } = await startDeployServer()
  try {
    await runFixture(t, 'config_save_none', {
      flags: { buildbotServerSocket: address, config: configPath, context: 'production', branch: 'main' },
    })
  } finally {
    await stopServer()
  }
})

test('--saveConfig creates netlify.toml if it does not exist', async (t) => {
  const fixtureDir = `${FIXTURES_DIR}/config_save_empty`
  const configPath = `${fixtureDir}/netlify.toml`
  await del(configPath)
  const { address, stopServer } = await startDeployServer()
  try {
    await runFixture(t, 'config_save_empty', {
      flags: {
        buildbotServerSocket: address,
        saveConfig: true,
        context: 'production',
        branch: 'main',
        defaultConfig: { plugins: [{ package: './plugin.js' }] },
      },
    })
    t.false(await pathExists(configPath))
  } finally {
    await stopServer()
  }
})

test('--saveConfig gives higher priority to configuration changes than context properties', async (t) => {
  const fixtureDir = `${FIXTURES_DIR}/config_save_context`
  const fixtureConfigPath = `${fixtureDir}/netlify.toml`
  const configPath = `${fixtureDir}/test_netlify.toml`
  await cpFile(fixtureConfigPath, configPath)
  const { address, stopServer } = await startDeployServer()
  try {
    await runFixture(t, 'config_save_context', {
      flags: {
        buildbotServerSocket: address,
        config: configPath,
        saveConfig: true,
        context: 'production',
        branch: 'main',
      },
    })
  } finally {
    await stopServer()
  }
})

test('--saveConfig is performed before deploy', async (t) => {
  const fixtureDir = `${FIXTURES_DIR}/config_save_deploy`
  const configPath = `${fixtureDir}/netlify.toml`
  await del(configPath)
  const { address, stopServer } = await startDeployServer()
  try {
    await runFixture(t, 'config_save_deploy', {
      flags: {
        buildbotServerSocket: address,
        saveConfig: true,
        context: 'production',
        branch: 'main',
        defaultConfig: { plugins: [{ package: './plugin.js' }] },
      },
    })
  } finally {
    await stopServer()
  }
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

// This package currently supports Node 8 but not zip-it-and-ship-it
// @todo remove once Node 8 support is removed
if (!version.startsWith('v8.')) {
  test('constants.FUNCTIONS_SRC uses legacy default functions directory if it exists', async (t) => {
    await runFixture(t, 'functions_src_legacy')
  })

  test('constants.FUNCTIONS_SRC ignores the legacy default functions directory if the new default directory exists', async (t) => {
    await runFixture(t, 'functions_src_default_and_legacy')
  })

  test('constants.FUNCTIONS_SRC relative path', async (t) => {
    await runFixture(t, 'functions_src_relative')
  })

  test('constants.FUNCTIONS_SRC dynamic is ignored if FUNCTIONS_SRC is specified', async (t) => {
    await runFixture(t, 'functions_src_dynamic_ignore', { copyRoot: { git: false } })
  })

  test('constants.FUNCTIONS_SRC dynamic should bundle Functions', async (t) => {
    await runFixture(t, 'functions_src_dynamic_bundle', { copyRoot: { git: false } })
  })
}

test('constants.FUNCTIONS_SRC automatic value', async (t) => {
  await runFixture(t, 'functions_src_auto')
})

test('constants.FUNCTIONS_SRC missing path', async (t) => {
  await runFixture(t, 'functions_src_missing')
})

test('constants.FUNCTIONS_SRC created dynamically', async (t) => {
  await runFixture(t, 'functions_src_dynamic', { copyRoot: { git: false } })
})

test('constants.FUNCTIONS_DIST', async (t) => {
  await runFixture(t, 'functions_dist')
})

test('constants.CACHE_DIR local', async (t) => {
  await runFixture(t, 'cache')
})

test('constants.CACHE_DIR CI', async (t) => {
  await runFixture(t, 'cache', { flags: { cacheDir: '/opt/build/cache' } })
})

// Node.js v8 test executions trigger a plugin warning when run with mode buildbot related with the Node.js version used
// to execute the plugins. Not too critical given production executions always run with Node v12.x
// @TODO remove once we drop Node v8 support or remove the plugin Node.js version warning - https://github.com/netlify/build/blob/6e718e3f040397ba30da5c32b275b914381685e0/packages/build/src/log/messages/plugins.js#L41-L48
if (!version.startsWith('v8.')) {
  test('constants.IS_LOCAL CI', async (t) => {
    await runFixture(t, 'is_local', { flags: { mode: 'buildbot' } })
  })
}

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

test('constants.NETLIFY_API_HOST', async (t) => {
  await runFixture(t, 'netlify_api_host', { flags: { apiHost: 'test.api.netlify.com' } })
})

test('constants.NETLIFY_API_HOST default value is set to api.netlify.com', async (t) => {
  await runFixture(t, 'netlify_api_host')
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

test('Functions: missing source directory', async (t) => {
  await runFixture(t, 'missing')
})

test('Functions: must not be a regular file', async (t) => {
  await runFixture(t, 'regular_file')
})

// This package currently supports Node 8 but not zip-it-and-ship-it
// @todo remove once Node 8 support is removed
if (!version.startsWith('v8.')) {
  test('Functions: can be a symbolic link', async (t) => {
    await runFixture(t, 'symlink')
  })
}

test('Functions: default directory', async (t) => {
  await runFixture(t, 'default')
})

// This package currently supports Node 8 but not zip-it-and-ship-it
// @todo remove once Node 8 support is removed
if (!version.startsWith('v8.')) {
  test('Functions: simple setup', async (t) => {
    await removeDir(`${FIXTURES_DIR}/simple/.netlify/functions/`)
    await runFixture(t, 'simple')
  })

  test('Functions: no functions', async (t) => {
    await runFixture(t, 'none')
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
}

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

test('Deploy plugin sends deployDir as a path relative to repositoryRoot', async (t) => {
  const { address, requests, stopServer } = await startDeployServer()
  try {
    await runFixture(t, 'deploy_dir_path', { flags: { buildbotServerSocket: address }, snapshot: false })
  } finally {
    await stopServer()
  }

  const [{ deployDir }] = requests
  t.is(deployDir, normalize('base/publish'))
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

const isValidDeployReponse = function ({ action, deployDir }) {
  return ['deploySite', 'deploySiteAndAwaitLive'].includes(action) && typeof deployDir === 'string' && deployDir !== ''
}

const doesNotWaitForPostProcessing = function (request) {
  return request.action === 'deploySite'
}

const waitsForPostProcessing = function (request) {
  return request.action === 'deploySiteAndAwaitLive'
}

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
  const defaultConfig = { plugins: [{ package: 'netlify-plugin-test' }] }
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

const runWithApiMock = async function (
  t,
  fixtureName,
  { testPlugin, response = getPluginsList(testPlugin), ...flags } = {},
  status = 200,
) {
  const { scheme, host, stopServer } = await startServer({
    path: PLUGINS_LIST_URL,
    response,
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
const getPluginsList = function (testPlugin = DEFAULT_TEST_PLUGIN) {
  return pluginsList.map((plugin) => getPlugin(plugin, testPlugin))
}

const getPlugin = function (plugin, testPlugin) {
  if (plugin.package !== TEST_PLUGIN_NAME) {
    return plugin
  }

  return { ...plugin, ...testPlugin }
}

const TEST_PLUGIN_NAME = 'netlify-plugin-contextual-env'
const TEST_PLUGIN_VERSION = '0.3.0'

const PLUGINS_LIST_URL = '/'
const DEFAULT_TEST_PLUGIN = { version: TEST_PLUGIN_VERSION }
const DEFAULT_TEST_PLUGIN_RUNS = [{ package: TEST_PLUGIN_NAME, version: TEST_PLUGIN_VERSION }]

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

test('Uses fallback when the plugins fetch succeeds with an invalid response', async (t) => {
  await runWithApiMock(t, 'plugins_cache', { response: { error: 'test' } })
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

// Note: the `version` field is normalized to `1.0.0` in the test snapshots
test('Prints outdated plugins installed in package.json', async (t) => {
  await runWithApiMock(t, 'plugins_outdated_package_json')
})

test('Prints incompatible plugins installed in package.json', async (t) => {
  await runWithApiMock(t, 'plugins_incompatible_package_json', {
    testPlugin: {
      compatibility: [{ version: '0.3.0' }, { version: '0.2.0', nodeVersion: '<100' }],
    },
  })
})

test('Does not print incompatible plugins installed in package.json if major version is same', async (t) => {
  await runWithApiMock(t, 'plugins_incompatible_package_json_same_major', {
    testPlugin: {
      compatibility: [{ version: '0.4.0' }, { version: '0.4.1', nodeVersion: '<100' }],
    },
  })
})

test('Does not print incompatible plugins installed in package.json if not using the compatibility field', async (t) => {
  await runWithApiMock(t, 'plugins_incompatible_package_json')
})

// `serial()` is needed due to the potential of re-installing the dependency
test.serial('Plugins can specify non-matching compatibility.nodeVersion', async (t) => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_node_version/.netlify`)
  await runWithApiMock(t, 'plugins_compat_node_version', {
    testPlugin: {
      compatibility: [
        { version: '0.3.0' },
        { version: '0.2.0', nodeVersion: '100 - 120' },
        { version: '0.1.0', nodeVersion: '<100' },
      ],
    },
  })
})

test.serial('Plugins ignore compatibility entries without conditions unless pinned', async (t) => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_node_version/.netlify`)
  await runWithApiMock(t, 'plugins_compat_node_version', {
    testPlugin: {
      compatibility: [{ version: '0.3.0' }, { version: '0.2.0' }, { version: '0.1.0', nodeVersion: '<100' }],
    },
  })
})

test.serial('Plugins does not ignore compatibility entries without conditions if pinned', async (t) => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_node_version/.netlify`)
  await runWithApiMock(t, 'plugins_compat_node_version', {
    testPlugin: {
      compatibility: [{ version: '0.3.0' }, { version: '0.2.0' }, { version: '0.1.0' }],
    },
    defaultConfig: { plugins: [{ package: TEST_PLUGIN_NAME, pinned_version: '0.2.0' }] },
  })
})

test.serial('Plugins ignore compatibility conditions if pinned', async (t) => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_node_version/.netlify`)
  await runWithApiMock(t, 'plugins_compat_node_version', {
    testPlugin: {
      compatibility: [{ version: '0.3.0' }, { version: '0.2.0', nodeVersion: '100 - 200' }, { version: '0.1.0' }],
    },
    defaultConfig: { plugins: [{ package: TEST_PLUGIN_NAME, pinned_version: '0.2.0' }] },
  })
})

test.serial('Plugins can specify matching compatibility.nodeVersion', async (t) => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_node_version/.netlify`)
  await runWithApiMock(t, 'plugins_compat_node_version', {
    testPlugin: {
      compatibility: [
        { version: '0.3.0' },
        { version: '0.2.0', nodeVersion: '6 - 120' },
        { version: '0.1.0', nodeVersion: '<6' },
      ],
    },
  })
})

test.serial('Plugins compatibility defaults to version field', async (t) => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_node_version/.netlify`)
  await runWithApiMock(t, 'plugins_compat_node_version', {
    testPlugin: {
      compatibility: [
        { version: '0.3.0' },
        { version: '0.2.0', nodeVersion: '4 - 6' },
        { version: '0.1.0', nodeVersion: '<4' },
      ],
    },
  })
})

test.serial('Plugins can specify compatibility.migrationGuide', async (t) => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_node_version/.netlify`)
  await runWithApiMock(t, 'plugins_compat_node_version', {
    testPlugin: {
      compatibility: [
        { version: '0.3.0', migrationGuide: 'http://test.com' },
        { version: '0.2.0', nodeVersion: '100 - 120' },
        { version: '0.1.0', nodeVersion: '<100' },
      ],
    },
  })
})

test.serial('Plugins can specify matching compatibility.siteDependencies', async (t) => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_site_dependencies/.netlify`)
  await runWithApiMock(t, 'plugins_compat_site_dependencies', {
    testPlugin: {
      compatibility: [{ version: '0.3.0' }, { version: '0.2.0', siteDependencies: { 'ansi-styles': '<3' } }],
    },
  })
})

test.serial('Plugins can specify non-matching compatibility.siteDependencies', async (t) => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_site_dependencies/.netlify`)
  await runWithApiMock(t, 'plugins_compat_site_dependencies', {
    testPlugin: {
      compatibility: [{ version: '0.3.0' }, { version: '0.2.0', siteDependencies: { 'ansi-styles': '<2' } }],
    },
  })
})

test.serial('Plugins can specify non-existing compatibility.siteDependencies', async (t) => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_site_dependencies/.netlify`)
  await runWithApiMock(t, 'plugins_compat_site_dependencies', {
    testPlugin: {
      compatibility: [{ version: '0.3.0' }, { version: '0.2.0', siteDependencies: { 'does-not-exist': '<3' } }],
    },
  })
})

test.serial('Plugins can specify multiple non-matching compatibility conditions', async (t) => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_site_dependencies/.netlify`)
  await runWithApiMock(t, 'plugins_compat_site_dependencies', {
    testPlugin: {
      compatibility: [
        { version: '0.3.0' },
        { version: '0.2.0', siteDependencies: { 'ansi-styles': '<3' }, nodeVersion: '100 - 120' },
      ],
    },
  })
})

test.serial('Plugins can specify multiple matching compatibility conditions', async (t) => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_site_dependencies/.netlify`)
  await runWithApiMock(t, 'plugins_compat_site_dependencies', {
    testPlugin: {
      compatibility: [
        { version: '0.3.0' },
        { version: '0.2.0', siteDependencies: { 'ansi-styles': '<3' }, nodeVersion: '<100' },
      ],
    },
  })
})

test.serial('Plugins can specify non-matching compatibility.siteDependencies range', async (t) => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_site_dependencies_range/.netlify`)
  await runWithApiMock(t, 'plugins_compat_site_dependencies_range', {
    testPlugin: {
      compatibility: [{ version: '0.3.0' }, { version: '0.2.0', siteDependencies: { 'dependency-with-range': '<10' } }],
    },
  })
})

test.serial('Plugin versions can be feature flagged', async (t) => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_node_version/.netlify`)
  await runWithApiMock(t, 'plugins_compat_node_version', {
    featureFlags: { some_feature_flag: true },
    testPlugin: {
      compatibility: [{ version: '0.3.0', featureFlag: 'some_feature_flag' }, { version: '0.2.0' }],
    },
  })
})

test.serial('Plugin versions that are feature flagged are ignored if no matching feature flag', async (t) => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_node_version/.netlify`)
  await runWithApiMock(t, 'plugins_compat_node_version', {
    testPlugin: {
      compatibility: [{ version: '0.3.0', featureFlag: 'some_feature_flag' }, { version: '0.2.0' }],
    },
  })
})

test.serial(
  'Plugin pinned versions that are feature flagged are not ignored if pinned but no matching feature flag',
  async (t) => {
    await removeDir(`${FIXTURES_DIR}/plugins_compat_node_version/.netlify`)
    await runWithApiMock(t, 'plugins_compat_node_version', {
      testPlugin: {
        compatibility: [{ version: '0.3.0', featureFlag: 'some_feature_flag' }, { version: '0.2.0' }],
      },
      defaultConfig: { plugins: [{ package: TEST_PLUGIN_NAME, pinned_version: '0.3.0' }] },
    })
  },
)

test.serial('Compatibility order take precedence over the `featureFlag` property', async (t) => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_node_version/.netlify`)
  await runWithApiMock(t, 'plugins_compat_node_version', {
    featureFlags: { some_feature_flag: true },
    testPlugin: {
      compatibility: [{ version: '0.3.0' }, { version: '0.2.0', featureFlag: 'some_feature_flag' }],
    },
  })
})

const getNodePath = function (nodeVersion) {
  return `/home/ether/.nvm/versions/node/v${nodeVersion}/bin/node`
}

const runWithUpdatePluginMock = async function (t, fixture, { flags, status, sendStatus = true, testPlugin } = {}) {
  const { scheme, host, requests, stopServer } = await startServer([
    { path: UPDATE_PLUGIN_PATH, status },
    { path: PLUGINS_LIST_URL, response: getPluginsList(testPlugin), status: 200 },
  ])
  try {
    await runFixture(t, fixture, {
      flags: {
        siteId: 'test',
        token: 'test',
        sendStatus,
        testOpts: { scheme, host, pluginsListUrl: `${scheme}://${host}` },
        defaultConfig: { plugins: [{ package: TEST_PLUGIN_NAME }] },
        ...flags,
      },
    })
  } finally {
    await stopServer()
  }
  t.snapshot(requests)
}

const UPDATE_PLUGIN_PATH = `/api/v1/sites/test/plugins/${TEST_PLUGIN_NAME}`

test('Pin plugin versions', async (t) => {
  await runWithUpdatePluginMock(t, 'pin_success')
})

test('Report updatePlugin API error without failing the build', async (t) => {
  await runWithUpdatePluginMock(t, 'pin_success', { status: 400 })
})

test('Does not report 404 updatePlugin API error', async (t) => {
  await runWithUpdatePluginMock(t, 'pin_success', { status: 404 })
})

test('Only pin plugin versions in production', async (t) => {
  await runWithUpdatePluginMock(t, 'pin_success', { sendStatus: false })
})

test('Do not pin plugin versions without an API token', async (t) => {
  await runWithUpdatePluginMock(t, 'pin_success', { flags: { token: '' } })
})

test('Do not pin plugin versions without a siteId', async (t) => {
  await runWithUpdatePluginMock(t, 'pin_success', { flags: { siteId: '' } })
})

test('Do not pin plugin versions if the build failed', async (t) => {
  await runWithUpdatePluginMock(t, 'pin_build_failed')
})

test('Do not pin plugin versions if the plugin failed', async (t) => {
  await runWithUpdatePluginMock(t, 'pin_plugin_failed')
})

test('Do not pin plugin versions if the build was installed in package.json', async (t) => {
  await runWithUpdatePluginMock(t, 'pin_module', { flags: { defaultConfig: {} } })
})

test('Do not pin plugin versions if already pinned', async (t) => {
  await runWithUpdatePluginMock(t, 'pin_success', {
    flags: { defaultConfig: { plugins: [{ package: TEST_PLUGIN_NAME, pinned_version: '0' }] } },
    testPlugin: { version: '1.0.0' },
  })
})

test('Pinning plugin versions takes into account the compatibility field', async (t) => {
  await runWithUpdatePluginMock(t, 'pin_success', {
    flags: { defaultConfig: { plugins: [{ package: TEST_PLUGIN_NAME, pinned_version: '0' }] } },
    testPlugin: {
      compatibility: [
        { version: '1.0.0' },
        { version: '100.0.0', nodeVersion: '<100' },
        { version: '0.3.0', nodeVersion: '<100' },
      ],
    },
  })
})

const runWithPluginRunsMock = async function (
  t,
  fixture,
  { flags, status, sendStatus = true, testPlugin, pluginRuns = DEFAULT_TEST_PLUGIN_RUNS } = {},
) {
  const { scheme, host, requests, stopServer } = await startServer([
    { path: PLUGIN_RUNS_PATH, response: pluginRuns, status },
    { path: PLUGINS_LIST_URL, response: getPluginsList(testPlugin), status: 200 },
  ])
  try {
    await runFixture(t, fixture, {
      flags: {
        siteId: 'test',
        token: 'test',
        sendStatus,
        testOpts: { scheme, host, pluginsListUrl: `${scheme}://${host}` },
        ...flags,
      },
    })
  } finally {
    await stopServer()
  }
  t.snapshot(requests)
}

const PLUGIN_RUNS_PATH = `/api/v1/sites/test/plugin_runs/latest`

test('Pin netlify.toml-only plugin versions', async (t) => {
  await runWithPluginRunsMock(t, 'pin_config_success')
})

test('Does not pin netlify.toml-only plugin versions if there are no matching plugin runs', async (t) => {
  await runWithPluginRunsMock(t, 'pin_config_success', { pluginRuns: [{ package: `${TEST_PLUGIN_NAME}-test` }] })
})

test('Does not pin netlify.toml-only plugin versions if there are no plugin runs', async (t) => {
  await runWithPluginRunsMock(t, 'pin_config_success', { pluginRuns: [] })
})

test('Does not pin netlify.toml-only plugin versions if there are no matching plugin runs version', async (t) => {
  await runWithPluginRunsMock(t, 'pin_config_success', { pluginRuns: [{ package: TEST_PLUGIN_NAME }] })
})

// Node 10 `util.inspect()` prints the API error differently
// @todo remove after removing support for Node 10
if (!version.startsWith('v10.')) {
  test('Fails the build when pinning netlify.toml-only plugin versions and the API request fails', async (t) => {
    await runWithPluginRunsMock(t, 'pin_config_success', { status: 400 })
  })
}

test('Does not pin netlify.toml-only plugin versions if already pinned', async (t) => {
  await runWithPluginRunsMock(t, 'pin_config_success', {
    flags: { defaultConfig: { plugins: [{ package: TEST_PLUGIN_NAME, pinned_version: '0' }] } },
  })
})

test('Does not pin netlify.toml-only plugin versions if installed in UI', async (t) => {
  await runWithPluginRunsMock(t, 'pin_config_ui', {
    flags: { defaultConfig: { plugins: [{ package: TEST_PLUGIN_NAME }] } },
  })
})

test('Does not pin netlify.toml-only plugin versions if installed in package.json', async (t) => {
  await runWithPluginRunsMock(t, 'pin_config_module')
})

test('Does not pin netlify.toml-only plugin versions if there are no API token', async (t) => {
  await runWithPluginRunsMock(t, 'pin_config_success', { flags: { token: '' } })
})

test('Does not pin netlify.toml-only plugin versions if there are no site ID', async (t) => {
  await runWithPluginRunsMock(t, 'pin_config_success', { flags: { siteId: '' } })
})

test('Validate --node-path unsupported version does not fail when no plugins are used', async (t) => {
  const nodePath = getNodePath('8.2.0')
  await runFixture(t, 'empty', {
    flags: { nodePath },
  })
})

test('Validate --node-path version is supported by the plugin', async (t) => {
  const nodePath = getNodePath('12.0.0')
  await runFixture(t, 'engines', {
    flags: { nodePath },
  })
})

test('Validate --node-path exists', async (t) => {
  await runFixture(t, 'node_version_simple', {
    flags: { nodePath: '/doesNotExist' },
  })
})

// We need to run a minimum version of 10.18.0 for this test, as it relies on the plugin engines.node property
// @todo remove once Node 8 support is removed
if (!version.startsWith('v8.')) {
  test('Provided --node-path version is unused in buildbot for local plugin executions if <10.18.0', async (t) => {
    const nodePath = getNodePath('10.17.0')
    await runFixture(t, 'version_greater_than_minimum', {
      flags: { nodePath, mode: 'buildbot' },
    })
  })
}

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

test('build.environment changes are propagated to other plugins', async (t) => {
  await runFixture(t, 'env_changes_build_plugin')
})

test('build.environment changes are propagated to onError and onEnd', async (t) => {
  await runFixture(t, 'env_changes_build_on_error')
})

test('build.environment changes are propagated to build.command', async (t) => {
  await runFixture(t, 'env_changes_build_command')
})

test('build.environment and process.env changes can be mixed', async (t) => {
  await runFixture(t, 'env_changes_build_mix')
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

test('Can run list util', async (t) => {
  await runFixture(t, 'functions_list')
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
