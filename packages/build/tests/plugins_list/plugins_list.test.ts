import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'

import { pluginsList } from '@netlify/plugins-list'
import { Fixture, normalizeOutput, removeDir, startServer } from '@netlify/testing'
import cpy from 'cpy'
import { expect, test } from 'vitest'

import type { PluginListEntry } from '../../lib/plugins/list.js'

const FIXTURES_DIR = fileURLToPath(new URL('fixtures', import.meta.url))

type TestPlugin = Partial<Pick<PluginListEntry, 'version' | 'compatibility'>>

interface ApiMockOptions {
  testPlugin?: TestPlugin
  response?: object
  [flag: string]: unknown
}

const runWithApiMock = async function (
  fixtureName: string,
  { testPlugin, response = getPluginsList(testPlugin), ...flags }: ApiMockOptions = {},
  status = 200,
) {
  const { scheme, host, stopServer } = await startServer({
    path: PLUGINS_LIST_URL,
    response,
    status,
  })
  try {
    const output = await new Fixture(import.meta.url, `./fixtures/${fixtureName}`)
      .withFlags({
        testOpts: { pluginsListUrl: `${scheme}://${host}` },
        ...flags,
      })
      .runWithBuild()
    return normalizeOutput(output)
  } finally {
    await stopServer()
  }
}

// We use a specific plugin in tests. We hardcode its version to keep the tests
// stable even when new versions of that plugin are published.
const getPluginsList = function (testPlugin: TestPlugin = DEFAULT_TEST_PLUGIN) {
  return pluginsList.map((plugin) => getPlugin(plugin, testPlugin))
}

const getPlugin = function (plugin: PluginListEntry, testPlugin: TestPlugin) {
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

test('Install plugins in .netlify/plugins/ when not cached', async () => {
  await removeDir(`${FIXTURES_DIR}/valid_package/.netlify`)
  try {
    expect(await runWithApiMock('valid_package')).toMatchSnapshot()
  } finally {
    await removeDir(`${FIXTURES_DIR}/valid_package/.netlify`)
  }
})

test('Use plugins cached in .netlify/plugins/', async () => {
  expect(await runWithApiMock('plugins_cache')).toMatchSnapshot()
})

test('Do not use plugins cached in .netlify/plugins/ if outdated', async () => {
  const pluginsDir = `${FIXTURES_DIR}/plugins_cache_outdated/.netlify/plugins`
  await removeDir(pluginsDir)
  await cpy('**', '../plugins', { cwd: `${pluginsDir}-old` })
  try {
    expect(await runWithApiMock('plugins_cache_outdated')).toMatchSnapshot()
  } finally {
    await removeDir(pluginsDir)
  }
})

test('Fetches the list of plugin versions', async () => {
  expect(await runWithApiMock('plugins_cache')).toMatchSnapshot()
})

test('Only prints the list of plugin versions in verbose mode', async () => {
  expect(await runWithApiMock('plugins_cache', { debug: false })).toMatchSnapshot()
})

test('Uses fallback when the plugins fetch fails', async () => {
  expect(await runWithApiMock('plugins_cache', {}, 500)).toMatchSnapshot()
})

test('Uses fallback when the plugins fetch succeeds with an invalid response', async () => {
  expect(await runWithApiMock('plugins_cache', { response: { error: 'test' } })).toMatchSnapshot()
})

test('Can execute local binaries when using .netlify/plugins/', async () => {
  expect(await runWithApiMock('plugins_cache_bin')).toMatchSnapshot()
})

test('Can require site dependencies when using .netlify/plugins/', async () => {
  expect(await runWithApiMock('plugins_cache_site_deps')).toMatchSnapshot()
})

test('Works with .netlify being a regular file', async () => {
  const dotNetlifyFile = `${FIXTURES_DIR}/plugins_cache_regular_file/.netlify`
  await fs.writeFile(dotNetlifyFile, '')
  try {
    expect(await runWithApiMock('plugins_cache_regular_file')).toMatchSnapshot()
  } finally {
    await removeDir(dotNetlifyFile)
  }
})

test('Print a warning when using plugins not in plugins.json nor package.json', async () => {
  expect(await runWithApiMock('invalid_package')).toMatchSnapshot()
})

test('Can use local plugins even when some plugins are cached', async () => {
  expect(await runWithApiMock('plugins_cache_local')).toMatchSnapshot()
})

// Note: the `version` field is normalized to `1.0.0` in the test snapshots
test('Prints outdated plugins installed in package.json', async () => {
  expect(await runWithApiMock('plugins_outdated_package_json')).toMatchSnapshot()
})

test('Prints incompatible plugins installed in package.json', async () => {
  expect(
    await runWithApiMock('plugins_incompatible_package_json', {
      testPlugin: {
        compatibility: [{ version: '0.3.0' }, { version: '0.2.0', nodeVersion: '<100' }],
      },
    }),
  ).toMatchSnapshot()
})

test('Does not print incompatible plugins installed in package.json if major version is same', async () => {
  expect(
    await runWithApiMock('plugins_incompatible_package_json_same_major', {
      testPlugin: {
        compatibility: [{ version: '0.4.0' }, { version: '0.4.1', nodeVersion: '<100' }],
      },
    }),
  ).toMatchSnapshot()
})

test('Does not print incompatible plugins installed in package.json if not using the compatibility field', async () => {
  expect(await runWithApiMock('plugins_incompatible_package_json')).toMatchSnapshot()
})

// `serial()` is needed due to the potential of re-installing the dependency
test('Plugins can specify non-matching compatibility.nodeVersion', async () => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_node_version/.netlify`)
  expect(
    await runWithApiMock('plugins_compat_node_version', {
      testPlugin: {
        compatibility: [
          { version: '0.3.0' },
          { version: '0.2.0', nodeVersion: '100 - 120' },
          { version: '0.1.0', nodeVersion: '<100' },
        ],
      },
    }),
  ).toMatchSnapshot()
})

test('Plugins ignore compatibility entries without conditions unless pinned', async () => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_node_version/.netlify`)
  expect(
    await runWithApiMock('plugins_compat_node_version', {
      testPlugin: {
        compatibility: [{ version: '0.3.0' }, { version: '0.2.0' }, { version: '0.1.0', nodeVersion: '<100' }],
      },
    }),
  ).toMatchSnapshot()
})

test('Plugins does not ignore compatibility entries without conditions if pinned', async () => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_node_version/.netlify`)
  expect(
    await runWithApiMock('plugins_compat_node_version', {
      testPlugin: {
        compatibility: [{ version: '0.3.0' }, { version: '0.2.0' }, { version: '0.1.0' }],
      },
      defaultConfig: { plugins: [{ package: TEST_PLUGIN_NAME, pinned_version: '0.2.0' }] },
    }),
  ).toMatchSnapshot()
})

test('Plugins ignore compatibility conditions if pinned', async () => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_node_version/.netlify`)
  expect(
    await runWithApiMock('plugins_compat_node_version', {
      testPlugin: {
        compatibility: [{ version: '0.3.0' }, { version: '0.2.0', nodeVersion: '100 - 200' }, { version: '0.1.0' }],
      },
      defaultConfig: { plugins: [{ package: TEST_PLUGIN_NAME, pinned_version: '0.2.0' }] },
    }),
  ).toMatchSnapshot()
})

test('Plugins can specify matching compatibility.nodeVersion', async () => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_node_version/.netlify`)
  expect(
    await runWithApiMock('plugins_compat_node_version', {
      testPlugin: {
        compatibility: [
          { version: '0.3.0' },
          { version: '0.2.0', nodeVersion: '6 - 120' },
          { version: '0.1.0', nodeVersion: '<6' },
        ],
      },
    }),
  ).toMatchSnapshot()
})

test('Plugins compatibility defaults to version field', async () => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_node_version/.netlify`)
  expect(
    await runWithApiMock('plugins_compat_node_version', {
      testPlugin: {
        compatibility: [
          { version: '0.3.0' },
          { version: '0.2.0', nodeVersion: '4 - 6' },
          { version: '0.1.0', nodeVersion: '<4' },
        ],
      },
    }),
  ).toMatchSnapshot()
})

test('Plugins can specify compatibility.migrationGuide', async () => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_node_version/.netlify`)
  expect(
    await runWithApiMock('plugins_compat_node_version', {
      testPlugin: {
        compatibility: [
          { version: '0.3.0', migrationGuide: 'http://test.com' },
          { version: '0.2.0', nodeVersion: '100 - 120' },
          { version: '0.1.0', nodeVersion: '<100' },
        ],
      },
    }),
  ).toMatchSnapshot()
})

test('Plugins can specify matching compatibility.siteDependencies', async () => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_site_dependencies/.netlify`)
  expect(
    await runWithApiMock('plugins_compat_site_dependencies', {
      testPlugin: {
        compatibility: [{ version: '0.3.0' }, { version: '0.2.0', siteDependencies: { 'ansi-styles': '<3' } }],
      },
    }),
  ).toMatchSnapshot()
})

test('Plugins can specify non-matching compatibility.siteDependencies', async () => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_site_dependencies/.netlify`)
  expect(
    await runWithApiMock('plugins_compat_site_dependencies', {
      testPlugin: {
        compatibility: [{ version: '0.3.0' }, { version: '0.2.0', siteDependencies: { 'ansi-styles': '<2' } }],
      },
    }),
  ).toMatchSnapshot()
})

test('Plugins can specify non-existing compatibility.siteDependencies', async () => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_site_dependencies/.netlify`)
  expect(
    await runWithApiMock('plugins_compat_site_dependencies', {
      testPlugin: {
        compatibility: [{ version: '0.3.0' }, { version: '0.2.0', siteDependencies: { 'does-not-exist': '<3' } }],
      },
    }),
  ).toMatchSnapshot()
})

test('Plugins can specify multiple non-matching compatibility conditions', async () => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_site_dependencies/.netlify`)
  expect(
    await runWithApiMock('plugins_compat_site_dependencies', {
      testPlugin: {
        compatibility: [
          { version: '0.3.0' },
          { version: '0.2.0', siteDependencies: { 'ansi-styles': '<3' }, nodeVersion: '100 - 120' },
        ],
      },
    }),
  ).toMatchSnapshot()
})

test('Plugins can specify multiple matching compatibility conditions', async () => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_site_dependencies/.netlify`)
  expect(
    await runWithApiMock('plugins_compat_site_dependencies', {
      testPlugin: {
        compatibility: [
          { version: '0.3.0' },
          { version: '0.2.0', siteDependencies: { 'ansi-styles': '<3' }, nodeVersion: '<100' },
        ],
      },
    }),
  ).toMatchSnapshot()
})

test('Plugins can specify non-matching compatibility.siteDependencies range', async () => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_site_dependencies_range/.netlify`)
  expect(
    await runWithApiMock('plugins_compat_site_dependencies_range', {
      testPlugin: {
        compatibility: [
          { version: '0.3.0' },
          { version: '0.2.0', siteDependencies: { '@netlify/dependency-with-range': '<10' } },
        ],
      },
    }),
  ).toMatchSnapshot()
})

test('Plugins can specify matching compatibility.siteDependencies range in monorepo with hoisted node_modules', async () => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_site_dependencies_range_monorepo_hoisted/apps/web/.netlify`)
  const normalizedOutput = await runWithApiMock('plugins_compat_site_dependencies_range_monorepo_hoisted', {
    testPlugin: {
      compatibility: [
        { version: '0.3.0' },
        {
          version: '0.2.0',
          siteDependencies: {
            // this is satisfied, so this version should be selected
            '@netlify/dependency-with-range': '<10',
          },
        },
      ],
    },
    packagePath: 'apps/web',
  })
  expect(normalizedOutput).toContain(
    'netlify-plugin-contextual-env 0-2-0 from netlify.toml (latest 0-3-0, expected 0-2-0, compatible 0-2-0)',
  )
})

test('Plugins can specify matching compatibility.siteDependencies range in monorepo without hoisted node_modules', async () => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_site_dependencies_range_monorepo_not_hoisted/apps/web/.netlify`)
  const normalizedOutput = await runWithApiMock('plugins_compat_site_dependencies_range_monorepo_not_hoisted', {
    testPlugin: {
      compatibility: [
        { version: '0.3.0' },
        {
          version: '0.2.0',
          siteDependencies: {
            // this is satisfied, so this version should be selected
            '@netlify/dependency-with-range': '<10',
          },
        },
      ],
    },
    packagePath: 'apps/web',
  })
  expect(normalizedOutput).toContain(
    'netlify-plugin-contextual-env 0-2-0 from netlify.toml (latest 0-3-0, expected 0-2-0, compatible 0-2-0)',
  )
})

test('Plugin versions can be feature flagged', async () => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_node_version/.netlify`)
  expect(
    await runWithApiMock('plugins_compat_node_version', {
      featureFlags: { some_feature_flag: true },
      testPlugin: {
        compatibility: [{ version: '0.3.0', featureFlag: 'some_feature_flag' }, { version: '0.2.0' }],
      },
    }),
  ).toMatchSnapshot()
})

test('Plugin versions that are feature flagged are ignored if no matching feature flag', async () => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_node_version/.netlify`)
  expect(
    await runWithApiMock('plugins_compat_node_version', {
      testPlugin: {
        compatibility: [{ version: '0.3.0', featureFlag: 'some_feature_flag' }, { version: '0.2.0' }],
      },
    }),
  ).toMatchSnapshot()
})

test('Plugin pinned versions that are feature flagged are not ignored if pinned but no matching feature flag', async () => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_node_version/.netlify`)
  expect(
    await runWithApiMock('plugins_compat_node_version', {
      testPlugin: {
        compatibility: [{ version: '0.3.0', featureFlag: 'some_feature_flag' }, { version: '0.2.0' }],
      },
      defaultConfig: { plugins: [{ package: TEST_PLUGIN_NAME, pinned_version: '0.3.0' }] },
    }),
  ).toMatchSnapshot()
})

test('Compatibility order take precedence over the `featureFlag` property', async () => {
  await removeDir(`${FIXTURES_DIR}/plugins_compat_node_version/.netlify`)
  expect(
    await runWithApiMock('plugins_compat_node_version', {
      featureFlags: { some_feature_flag: true },
      testPlugin: {
        compatibility: [{ version: '0.3.0' }, { version: '0.2.0', featureFlag: 'some_feature_flag' }],
      },
    }),
  ).toMatchSnapshot()
})

interface UpdatePluginMockOptions {
  flags?: Record<string, unknown>
  status?: number
  sendStatus?: boolean
  testPlugin?: TestPlugin
}

const runWithUpdatePluginMock = async function (
  fixture: string,
  { flags, status, sendStatus = true, testPlugin }: UpdatePluginMockOptions = {},
) {
  const { scheme, host, stopServer } = await startServer([
    { path: UPDATE_PLUGIN_PATH, status },
    { path: PLUGINS_LIST_URL, response: getPluginsList(testPlugin), status: 200 },
    { path: '/site/test/integrations/safe', response: [] },
  ])
  try {
    const output = await new Fixture(import.meta.url, `./fixtures/${fixture}`)
      .withFlags({
        siteId: 'test',
        token: 'test',
        sendStatus,
        testOpts: { scheme, host, pluginsListUrl: `${scheme}://${host}` },
        defaultConfig: { plugins: [{ package: TEST_PLUGIN_NAME }] },
        ...flags,
      })
      .runWithBuild()
    return normalizeOutput(output)
  } finally {
    await stopServer()
  }
}

const UPDATE_PLUGIN_PATH = `/api/v1/sites/test/plugins/${TEST_PLUGIN_NAME}`

test('Pin plugin versions', async () => {
  expect(await runWithUpdatePluginMock('pin_success')).toMatchSnapshot()
})

test('Report updatePlugin API error without failing the build', async () => {
  expect(await runWithUpdatePluginMock('pin_success', { status: 400 })).toMatchSnapshot()
})

test('Does not report 404 updatePlugin API error', async () => {
  expect(await runWithUpdatePluginMock('pin_success', { status: 404 })).toMatchSnapshot()
})

test('Only pin plugin versions in production', async () => {
  expect(await runWithUpdatePluginMock('pin_success', { sendStatus: false })).toMatchSnapshot()
})

test('Do not pin plugin versions without an API token', async () => {
  expect(await runWithUpdatePluginMock('pin_success', { flags: { token: '' } })).toMatchSnapshot()
})

test('Do not pin plugin versions without a siteId', async () => {
  expect(await runWithUpdatePluginMock('pin_success', { flags: { siteId: '' } })).toMatchSnapshot()
})

test('Do not pin plugin versions if the build failed', async () => {
  expect(await runWithUpdatePluginMock('pin_build_failed')).toMatchSnapshot()
})

test('Do not pin plugin versions if the plugin failed', async () => {
  expect(await runWithUpdatePluginMock('pin_plugin_failed')).toMatchSnapshot()
})

test('Do not pin plugin versions if the build was installed in package.json', async () => {
  expect(await runWithUpdatePluginMock('pin_module', { flags: { defaultConfig: {} } })).toMatchSnapshot()
})

test('Do not pin plugin versions if already pinned', async () => {
  expect(
    await runWithUpdatePluginMock('pin_success', {
      flags: { defaultConfig: { plugins: [{ package: TEST_PLUGIN_NAME, pinned_version: '0' }] } },
      testPlugin: { version: '1.0.0' },
    }),
  ).toMatchSnapshot()
})

test('Pinning plugin versions takes into account the compatibility field', async () => {
  expect(
    await runWithUpdatePluginMock('pin_success', {
      flags: { defaultConfig: { plugins: [{ package: TEST_PLUGIN_NAME, pinned_version: '0' }] } },
      testPlugin: {
        compatibility: [
          { version: '1.0.0' },
          { version: '100.0.0', nodeVersion: '<100' },
          { version: '0.3.0', nodeVersion: '<100' },
        ],
      },
    }),
  ).toMatchSnapshot()
})

test('Do not pin plugin with prerelease versions', async () => {
  // By setting the status to 500 we ensure that the endpoint for pinning is
  // not being called, otherwise an error would be thrown.
  expect(
    await runWithUpdatePluginMock('pin_prerelease', { status: 500, testPlugin: { version: '1.2.3-rc' } }),
  ).toMatchSnapshot()
})

interface PluginRunsMockOptions extends UpdatePluginMockOptions {
  pluginRuns?: object[]
}

const runWithPluginRunsMock = async function (
  fixtureName: string,
  { flags, status, sendStatus = true, testPlugin, pluginRuns = DEFAULT_TEST_PLUGIN_RUNS }: PluginRunsMockOptions = {},
) {
  const { scheme, host, stopServer } = await startServer([
    { path: PLUGIN_RUNS_PATH, response: pluginRuns, status },
    { path: PLUGINS_LIST_URL, response: getPluginsList(testPlugin), status: 200 },
    { path: '/site/test/integrations/safe', response: [] },
  ])
  try {
    const output = await new Fixture(import.meta.url, `./fixtures/${fixtureName}`)
      .withFlags({
        siteId: 'test',
        token: 'test',
        sendStatus,
        testOpts: { scheme, host, pluginsListUrl: `${scheme}://${host}` },
        ...flags,
      })
      .runWithBuild()
    return normalizeOutput(output)
  } finally {
    await stopServer()
  }
}

const PLUGIN_RUNS_PATH = `/api/v1/sites/test/plugin_runs/latest`

test('Pin netlify.toml-only plugin versions', async () => {
  expect(await runWithPluginRunsMock('pin_config_success')).toMatchSnapshot()
})

test('Does not pin netlify.toml-only plugin versions if there are no matching plugin runs', async () => {
  expect(
    await runWithPluginRunsMock('pin_config_success', { pluginRuns: [{ package: `${TEST_PLUGIN_NAME}-test` }] }),
  ).toMatchSnapshot()
})

test('Does not pin netlify.toml-only plugin versions if there are no plugin runs', async () => {
  expect(await runWithPluginRunsMock('pin_config_success', { pluginRuns: [] })).toMatchSnapshot()
})

test('Does not pin netlify.toml-only plugin versions if there are no matching plugin runs version', async () => {
  expect(
    await runWithPluginRunsMock('pin_config_success', { pluginRuns: [{ package: TEST_PLUGIN_NAME }] }),
  ).toMatchSnapshot()
})

test('Fails the build when pinning netlify.toml-only plugin versions and the API request fails', async () => {
  expect(await runWithPluginRunsMock('pin_config_success', { status: 400 })).toMatchSnapshot()
})

test('Does not pin netlify.toml-only plugin versions if already pinned', async () => {
  expect(
    await runWithPluginRunsMock('pin_config_success', {
      flags: { defaultConfig: { plugins: [{ package: TEST_PLUGIN_NAME, pinned_version: '0' }] } },
    }),
  ).toMatchSnapshot()
})

test('Does not pin netlify.toml-only plugin versions if installed in UI', async () => {
  expect(
    await runWithPluginRunsMock('pin_config_ui', {
      flags: { defaultConfig: { plugins: [{ package: TEST_PLUGIN_NAME }] } },
    }),
  ).toMatchSnapshot()
})

test('Does not pin netlify.toml-only plugin versions if installed in package.json', async () => {
  expect(await runWithPluginRunsMock('pin_config_module')).toMatchSnapshot()
})

test('Does not pin netlify.toml-only plugin versions if there are no API token', async () => {
  expect(await runWithPluginRunsMock('pin_config_success', { flags: { token: '' } })).toMatchSnapshot()
})

test('Does not pin netlify.toml-only plugin versions if there are no site ID', async () => {
  expect(await runWithPluginRunsMock('pin_config_success', { flags: { siteId: '' } })).toMatchSnapshot()
})
