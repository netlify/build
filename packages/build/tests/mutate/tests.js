import test from 'ava'

import { runFixture } from '../helpers/main.js'

test('Pass netlifyConfig to plugins', async (t) => {
  await runFixture(t, 'valid')
})

test('netlifyConfig properties are readonly (set) by default', async (t) => {
  await runFixture(t, 'readonly_set')
})

test('netlifyConfig properties are readonly (delete) by default', async (t) => {
  await runFixture(t, 'readonly_delete')
})

test('netlifyConfig properties are readonly (defineProperty) by default', async (t) => {
  await runFixture(t, 'readonly_define')
})

test('Some netlifyConfig properties can be mutated', async (t) => {
  await runFixture(t, 'general')
})

test('netlifyConfig properties cannot be deleted', async (t) => {
  await runFixture(t, 'delete')
})

test('netlifyConfig properties cannot be assigned to undefined', async (t) => {
  await runFixture(t, 'set_undefined')
})

test('netlifyConfig properties cannot be assigned to null', async (t) => {
  await runFixture(t, 'set_null')
})

test('netlifyConfig properties cannot be assigned to undefined with defineProperty', async (t) => {
  await runFixture(t, 'define_undefined')
})

test('netlifyConfig properties mutations is persisted', async (t) => {
  await runFixture(t, 'persist')
})

test('netlifyConfig array properties can be mutated per index', async (t) => {
  await runFixture(t, 'array_index')
})

test('netlifyConfig array properties can be pushed', async (t) => {
  await runFixture(t, 'array_push')
})

test('netlifyConfig.functionsDirectory mutations are used during functions bundling', async (t) => {
  await runFixture(t, 'functions_directory_bundling')
})

test('netlifyConfig.functionsDirectory deletion skips functions bundling', async (t) => {
  await runFixture(t, 'functions_directory_skip')
})

test('netlifyConfig.functionsDirectory mutations are used by utils.functions', async (t) => {
  await runFixture(t, 'functions_directory_utils')
})

test('netlifyConfig.functionsDirectory mutations are used by constants.FUNCTIONS_SRC', async (t) => {
  await runFixture(t, 'functions_directory_constants')
})

test('netlifyConfig.functionsDirectory mutations are taken into account by default constants.FUNCTIONS_SRC', async (t) => {
  await runFixture(t, 'functions_directory_default')
})

test('netlifyConfig.functions.star.directory mutations work', async (t) => {
  await runFixture(t, 'functions_directory_star')
})

test('netlifyConfig.functions.star.directory has priority over functions.directory', async (t) => {
  await runFixture(t, 'functions_directory_star_priority')
})

test('netlifyConfig.functions.directory mutations work', async (t) => {
  await runFixture(t, 'functions_directory_nested')
})

test('netlifyConfig.functions.directory has priority over functions.star.directory', async (t) => {
  await runFixture(t, 'functions_directory_nested_priority')
})

test('netlifyConfig.build.functions mutations work', async (t) => {
  await runFixture(t, 'functions_directory_build')
})

test('netlifyConfig.functions mutations are used during functions bundling', async (t) => {
  await runFixture(t, 'functions_bundling')
})

test('netlifyConfig.functions mutations on any property can be used', async (t) => {
  await runFixture(t, 'functions_any')
})

test('netlifyConfig.functions mutations can add new functions configs', async (t) => {
  await runFixture(t, 'functions_new')
})

test('netlifyConfig.functions mutations are only logged in debug mode', async (t) => {
  await runFixture(t, 'functions_no_log_debug', { flags: { debug: false } })
})

test('netlifyConfig properties are deeply readonly by default', async (t) => {
  await runFixture(t, 'readonly_deep')
})

test('netlifyConfig.processing can be assigned all at once', async (t) => {
  await runFixture(t, 'processing_all')
})

test('netlifyConfig.processing can be assigned individually', async (t) => {
  await runFixture(t, 'processing_prop')
})

test('netlifyConfig.build.command can be changed', async (t) => {
  await runFixture(t, 'build_command_change')
})

test('netlifyConfig.build.command can be added', async (t) => {
  await runFixture(t, 'build_command_add')
})

test('netlifyConfig.build.command can be removed', async (t) => {
  await runFixture(t, 'build_command_remove')
})

test('netlifyConfig.build.environment can be assigned all at once', async (t) => {
  await runFixture(t, 'env_all')
})

test('netlifyConfig.build.environment can be assigned individually', async (t) => {
  await runFixture(t, 'env_prop')
})

test('netlifyConfig.build.publish mutations are used by constants.PUBLISH_DIR', async (t) => {
  await runFixture(t, 'publish_constants')
})

test('netlifyConfig.build.edge_functions mutations are used by constants.EDGE_FUNCTIONS_SRC', async (t) => {
  await runFixture(t, 'edge_functions_constants', { flags: { debug: false } })
})

test('netlifyConfig.edge_functions can be assigned all at once', async (t) => {
  await runFixture(t, 'edge_functions_all', { flags: { debug: false } })
})

test('netlifyConfig.services can be assigned all at once', async (t) => {
  await runFixture(t, 'services_all')
})

test('netlifyConfig.services can be assigned individually', async (t) => {
  await runFixture(t, 'services_prop')
})

test('netlifyConfig mutations fail if done in an event that is too late', async (t) => {
  await runFixture(t, 'too_late')
})

test('netlifyConfig mutations fail correctly on symbols', async (t) => {
  await runFixture(t, 'symbol')
})

test('netlifyConfig mutations fail if the syntax is invalid', async (t) => {
  await runFixture(t, 'invalid_syntax')
})
