const test = require('ava')

const { removeDir } = require('../helpers/dir')
const { runFixture, FIXTURES_DIR } = require('../helpers/main')
const { getTempDir } = require('../helpers/temp')

test('constants.CONFIG_PATH', async t => {
  await runFixture(t, 'config')
})

test('constants.PUBLISH_DIR default value', async t => {
  await runFixture(t, 'publish_default')
})

test('constants.PUBLISH_DIR default value with build.base', async t => {
  await runFixture(t, 'publish_default_base')
})

test('constants.PUBLISH_DIR absolute path', async t => {
  await runFixture(t, 'publish_absolute')
})

test('constants.PUBLISH_DIR relative path', async t => {
  await runFixture(t, 'publish_relative')
})

test('constants.PUBLISH_DIR missing path', async t => {
  await runFixture(t, 'publish_missing')
})

test('constants.FUNCTIONS_SRC default value', async t => {
  await runFixture(t, 'functions_src_default')
})

test('constants.FUNCTIONS_SRC relative path', async t => {
  await runFixture(t, 'functions_src_relative')
})

test('constants.FUNCTIONS_SRC automatic value', async t => {
  await runFixture(t, 'functions_src_auto')
})

test('constants.FUNCTIONS_SRC missing path', async t => {
  await runFixture(t, 'functions_src_missing')
})

test('constants.FUNCTIONS_DIST', async t => {
  await runFixture(t, 'functions_dist')
})

test('constants.CACHE_DIR local', async t => {
  await runFixture(t, 'cache')
})

test('constants.CACHE_DIR CI', async t => {
  await runFixture(t, 'cache', { flags: { mode: 'buildbot' } })
})

test('constants.IS_LOCAL CI', async t => {
  await runFixture(t, 'is_local', { flags: { mode: 'buildbot' } })
})

test('constants.SITE_ID', async t => {
  await runFixture(t, 'site_id', { flags: { siteId: 'test' } })
})

test('constants.IS_LOCAL local', async t => {
  await runFixture(t, 'is_local')
})

test('constants.NETLIFY_BUILD_VERSION', async t => {
  await runFixture(t, 'netlify_build_version')
})

test('Functions: simple setup', async t => {
  await removeDir(`${FIXTURES_DIR}/simple/.netlify/functions/`)
  await runFixture(t, 'simple')
})

test('Functions: missing source directory', async t => {
  await runFixture(t, 'missing')
})

test('Functions: must not be a regular file', async t => {
  await runFixture(t, 'regular_file')
})

test('Functions: no functions', async t => {
  await runFixture(t, 'none')
})

test('Functions: default directory', async t => {
  await runFixture(t, 'default')
})

test('Functions: --functionsDistDir', async t => {
  const functionsDistDir = await getTempDir()
  try {
    await runFixture(t, 'simple', { flags: { functionsDistDir } })
  } finally {
    await removeDir(functionsDistDir)
  }
})

test('plugin.onSuccess is triggered on success', async t => {
  await runFixture(t, 'success_ok')
})

test('plugin.onSuccess is not triggered on failure', async t => {
  await runFixture(t, 'success_not_ok')
})

test('plugin.onSuccess is not triggered on failPlugin()', async t => {
  await runFixture(t, 'success_fail_plugin')
})

test('plugin.onSuccess is not triggered on cancelBuild()', async t => {
  await runFixture(t, 'success_cancel_build')
})

test('plugin.onSuccess can fail', async t => {
  await runFixture(t, 'success_fail')
})

test('plugin.onError is not triggered on success', async t => {
  await runFixture(t, 'error_ok')
})

test('plugin.onError is triggered on failure', async t => {
  await runFixture(t, 'error_not_ok')
})

test('plugin.onError is triggered on failPlugin()', async t => {
  await runFixture(t, 'error_fail_plugin')
})

test('plugin.onError is triggered on cancelBuild()', async t => {
  await runFixture(t, 'error_cancel_build')
})

test('plugin.onError gets an error argument', async t => {
  await runFixture(t, 'error_argument')
})

test('plugin.onError can be used in several plugins', async t => {
  await runFixture(t, 'error_several')
})

test('plugin.onEnd is triggered on success', async t => {
  await runFixture(t, 'end_ok')
})

test('plugin.onEnd is triggered on failure', async t => {
  await runFixture(t, 'end_not_ok')
})

test('plugin.onEnd is triggered on failPlugin()', async t => {
  await runFixture(t, 'end_fail_plugin')
})

test('plugin.onEnd is triggered on cancelBuild()', async t => {
  await runFixture(t, 'end_cancel_build')
})

test('plugin.onEnd can fail', async t => {
  await runFixture(t, 'end_fail')
})

test('plugin.onEnd and plugin.onError can be used together', async t => {
  await runFixture(t, 'end_error')
})

test('plugin.onEnd and plugin.onError can fail', async t => {
  await runFixture(t, 'end_error_fail')
})

test('plugin.onEnd can be used in several plugins', async t => {
  await runFixture(t, 'end_several')
})

test('Local plugins', async t => {
  await runFixture(t, 'local')
})

test('Local plugins directory', async t => {
  await runFixture(t, 'local_dir')
})

test('Local plugins absolute path', async t => {
  await runFixture(t, 'local_absolute')
})

test('Local plugins invalid path', async t => {
  await runFixture(t, 'local_invalid')
})

test('Node module plugins', async t => {
  await runFixture(t, 'module')
})

test('UI plugins', async t => {
  const defaultConfig = JSON.stringify({ plugins: [{ package: 'netlify-plugin-test' }] })
  await runFixture(t, 'ui', { flags: { defaultConfig } })
})

test('Resolution is relative to the build directory', async t => {
  await runFixture(t, 'basedir', { flags: { config: `${FIXTURES_DIR}/basedir/base/netlify.toml` } })
})

test('Non-existing plugins', async t => {
  await runFixture(t, 'non_existing')
})

test('Do not allow overriding core plugins', async t => {
  await runFixture(t, 'core_override')
})

test('Can use plugins cached in the build image', async t => {
  await runFixture(t, 'build_image', {
    flags: { buildImagePluginsDir: `${FIXTURES_DIR}/build_image_cache/node_modules` },
  })
})

test('Does not use plugins cached in the build image in local builds', async t => {
  await runFixture(t, 'build_image')
})

test('Can execute local binaries when using plugins cached in the build image', async t => {
  await runFixture(t, 'build_image_bin', {
    flags: { buildImagePluginsDir: `${FIXTURES_DIR}/build_image_cache_bin/node_modules` },
  })
})

const getNodePath = function(version) {
  return `/home/ether/.nvm/versions/node/v${version}/bin/node`
}

test('Validate --node-path version is supported by our codebase', async t => {
  const nodePath = getNodePath('8.2.0')
  await runFixture(t, 'node_version_simple', { flags: { nodePath } })
})

test('Validate --node-path unsupported version does not fail when no plugins are used', async t => {
  const nodePath = getNodePath('8.2.0')
  await runFixture(t, 'empty', { flags: { nodePath } })
})

test('Validate --node-path version is supported by the plugin', async t => {
  const nodePath = getNodePath('9.0.0')
  await runFixture(t, 'engines', { flags: { nodePath } })
})

test('Validate --node-path', async t => {
  await runFixture(t, 'node_version_simple', { flags: { nodePath: '/doesNotExist' } })
})

test('Plugins can execute local binaries', async t => {
  await runFixture(t, 'local_bin')
})

test('Plugin output can interleave stdout and stderr', async t => {
  await runFixture(t, 'interleave')
})

// TODO: check output length once big outputs are actually fixed
test.serial('Big plugin output is not truncated', async t => {
  await runFixture(t, 'big', { snapshot: false })
  t.pass()
})

test('Plugins can have inputs', async t => {
  await runFixture(t, 'inputs')
})

test('process.env changes are propagated to other plugins', async t => {
  await runFixture(t, 'env_changes_plugin')
})

test('process.env changes are propagated to onError and onEnd', async t => {
  await runFixture(t, 'env_changes_on_error')
})

test('process.env changes are propagated to build.command', async t => {
  await runFixture(t, 'env_changes_command')
})

test('Expose some utils', async t => {
  await runFixture(t, 'keys')
})

test('Utils are defined', async t => {
  await runFixture(t, 'defined')
})

test('Can run utils', async t => {
  await removeDir(`${FIXTURES_DIR}/functions/functions`)
  await runFixture(t, 'functions')
  await removeDir(`${FIXTURES_DIR}/functions/functions`)
})

test('Git utils fails if no root', async t => {
  await runFixture(t, 'git_no_root', { copyRoot: { git: false } })
})

test('Git utils does not fail if no root and not used', async t => {
  await runFixture(t, 'keys', { copyRoot: { git: false } })
})

test('Validate plugin is an object', async t => {
  await runFixture(t, 'object')
})

test('Validate plugin event handler names', async t => {
  await runFixture(t, 'handler_name')
})

test('Validate plugin event handler function', async t => {
  await runFixture(t, 'handler_function')
})

test('Validate plugin backward compatibility from manifest.yml with "name"', async t => {
  await runFixture(t, 'backward_compat_name')
})
