import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'

import { pluginsList } from '@netlify/plugins-list'
import { Fixture, normalizeOutput, removeDir, startServer } from '@netlify/testing'
import test from 'ava'
import cpy from 'cpy'

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

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
    const output = await new Fixture(`./fixtures/${fixtureName}`)
      .withFlags({
        testOpts: { pluginsListUrl: `${scheme}://${host}`, ...flags.testOpts },
        ...flags,
      })
      .runWithBuild()
    await t.snapshot(normalizeOutput(output))
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
  await cpy('**', '../plugins', { cwd: `${pluginsDir}-old` })
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
  await fs.writeFile(dotNetlifyFile, '')
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
      compatibility: [
        { version: '0.3.0' },
        { version: '0.2.0', siteDependencies: { '@netlify/dependency-with-range': '<10' } },
      ],
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

const runWithUpdatePluginMock = async function (t, fixture, { flags, status, sendStatus = true, testPlugin } = {}) {
  const { scheme, host, stopServer } = await startServer([
    { path: UPDATE_PLUGIN_PATH, status },
    { path: PLUGINS_LIST_URL, response: getPluginsList(testPlugin), status: 200 },
    { path: '/site/test/integrations/safe', response: [] },
  ])
  try {
    const output = await new Fixture(`./fixtures/${fixture}`)
      .withFlags({
        siteId: 'test',
        token: 'test',
        sendStatus,
        testOpts: { scheme, host, pluginsListUrl: `${scheme}://${host}` },
        defaultConfig: { plugins: [{ package: TEST_PLUGIN_NAME }] },
        ...flags,
      })
      .runWithBuild()
    t.snapshot(normalizeOutput(output))
  } finally {
    await stopServer()
  }
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

test('Do not pin plugin with prerelease versions', async (t) => {
  // By setting the status to 500 we ensure that the endpoint for pinning is
  // not being called, otherwise an error would be thrown.
  await runWithUpdatePluginMock(t, 'pin_prerelease', { status: 500, testPlugin: { version: '1.2.3-rc' } })
})

const runWithPluginRunsMock = async function (
  t,
  fixtureName,
  { flags, status, sendStatus = true, testPlugin, pluginRuns = DEFAULT_TEST_PLUGIN_RUNS } = {},
) {
  const { scheme, host, stopServer } = await startServer([
    { path: PLUGIN_RUNS_PATH, response: pluginRuns, status },
    { path: PLUGINS_LIST_URL, response: getPluginsList(testPlugin), status: 200 },
    { path: '/site/test/integrations/safe', response: [] },
  ])
  try {
    const output = await new Fixture(`./fixtures/${fixtureName}`)
      .withFlags({
        siteId: 'test',
        token: 'test',
        sendStatus,
        testOpts: { scheme, host, pluginsListUrl: `${scheme}://${host}` },
        ...flags,
      })
      .runWithBuild()
    await t.snapshot(normalizeOutput(output))
  } finally {
    await stopServer()
  }
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

test('Fails the build when pinning netlify.toml-only plugin versions and the API request fails', async (t) => {
  await runWithPluginRunsMock(t, 'pin_config_success', { status: 400 })
})

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
