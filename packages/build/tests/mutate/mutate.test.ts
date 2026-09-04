import os from 'os'

import { Fixture, normalizeOutput } from '@netlify/testing'
import { expect, test } from 'vitest'

test('Pass netlifyConfig to plugins', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/valid').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('netlifyConfig properties are readonly (set) by default', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/readonly_set').runWithBuild()
  expect(output).toContain(` Error: "netlifyConfig.build.ignore" is read-only.`)
})

test('netlifyConfig properties are readonly (delete) by default', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/readonly_delete').runWithBuild()
  expect(output).toContain(`Error: Setting "netlifyConfig.build.command" to undefined is not allowed.`)
})

test('netlifyConfig properties are readonly (defineProperty) by default', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/readonly_define').runWithBuild()
  expect(output).toContain(`Error: "netlifyConfig.build.ignore" is read-only.`)
})

test('Some netlifyConfig properties can be mutated', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/general').runWithBuild()
  expect(output).toContain(`Netlify configuration property "functions.directory" value changed to 'test_functions'.`)
})

test('netlifyConfig properties cannot be deleted', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/delete').runWithBuild()
  expect(output).toContain(`Error: Setting "netlifyConfig.build.command" to undefined is not allowed.`)
})

test('netlifyConfig properties cannot be assigned to undefined', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/set_undefined').runWithBuild()
  expect(output).toContain(`Error: Setting "netlifyConfig.build.command" to undefined is not allowed.`)
})

test('netlifyConfig properties cannot be assigned to null', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/set_null').runWithBuild()
  expect(output).toContain(`Error: Setting "netlifyConfig.build.command" to null is not allowed.`)
})

test('netlifyConfig properties cannot be assigned to undefined with defineProperty', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/define_undefined').runWithBuild()
  expect(output).toContain(`Error: Setting "netlifyConfig.build.command" to undefined is not allowed.`)
})

test('netlifyConfig properties mutations is persisted', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/persist').runWithBuild()
  expect(output).toContain(`Netlify configuration property "build.command" value changed to 'node --version'.`)
})

test('netlifyConfig array properties can be mutated per index', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/array_index').runWithBuild()
  expect(output).toContain(
    `Netlify configuration property "functions.*.included_files" value changed to [ 'one', 'two' ].`,
  )
})

test('netlifyConfig array properties can be pushed', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/array_push').runWithBuild()
  expect(output).toContain(
    `Netlify configuration property "functions.*.included_files" value changed to [ 'one', 'two' ].`,
  )
})

test('netlifyConfig.functionsDirectory mutations are used during functions bundling', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_directory_bundling').runWithBuild()
  expect(output).toContain(`Netlify configuration property "functions.directory" value changed to 'test_functions'.`)
})

test('netlifyConfig.functionsDirectory deletion skips functions bundling', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_directory_skip').runWithBuild()
  expect(output).toContain(`Netlify configuration property "functions.directory" value changed to ''.`)
})

test('netlifyConfig.functionsDirectory mutations are used by utils.functions', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_directory_utils').runWithBuild()
  expect(output).toContain(`Netlify configuration property "functions.directory" value changed to 'test_functions'.`)
})

test('netlifyConfig.functionsDirectory mutations are used by constants.FUNCTIONS_SRC', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_directory_constants').runWithBuild()
  expect(output).toContain(`Netlify configuration property "functions.directory" value changed to 'test_functions'.`)
})

test('netlifyConfig.functionsDirectory mutations are taken into account by default constants.FUNCTIONS_SRC', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_directory_default').runWithBuild()
  expect(output).toContain(`Netlify configuration property "functions.directory" value changed to 'test_functions'.`)
})

test('netlifyConfig.functions.star.directory mutations work', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_directory_star').runWithBuild()
  expect(output).toContain(`Netlify configuration property "functions.*.directory" value changed to 'test_functions'.`)
})

test('netlifyConfig.functions.star.directory has priority over functions.directory', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_directory_star_priority').runWithBuild()
  expect(output).toContain(`Netlify configuration property "functions.*.directory" value changed to 'test_functions'.`)
})

test('netlifyConfig.functions.directory mutations work', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_directory_nested').runWithBuild()
  expect(output).toContain(`Netlify configuration property "functions.directory" value changed to 'test_functions'.`)
})

test('netlifyConfig.functions.directory has priority over functions.star.directory', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_directory_nested_priority').runWithBuild()
  expect(output).toContain(`Netlify configuration property "functions.directory" value changed to 'test_functions'.`)
})

test('netlifyConfig.build.functions mutations work', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_directory_build').runWithBuild()
  expect(output).toContain(`Netlify configuration property "build.functions" value changed to 'test_functions'.`)
})

test('netlifyConfig.functions mutations are used during functions bundling', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_bundling').runWithBuild()
  expect(output).toContain(`Netlify configuration property "functions.test.node_bundler" value changed to 'zisi'.`)
})

test('netlifyConfig.functions mutations on any property can be used', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_any').runWithBuild()
  expect(output).toContain(`Netlify configuration property "functions.test.external_node_modules" value changed to [].`)
})

test('netlifyConfig.functions mutations can add new functions configs', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_new').runWithBuild()
  expect(output).toContain(`Netlify configuration property "functions.test" value changed to { included_files: [] }.`)
})

test('netlifyConfig.functions mutations are only logged in debug mode', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/functions_no_log_debug')
    .withFlags({ debug: false })
    .runWithBuild()
  expect(output).not.toContain(
    `Netlify configuration property "functions.test" value changed to { included_files: [] }.`,
  )
})

test('netlifyConfig properties are deeply readonly by default', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/readonly_deep').runWithBuild()
  expect(output).toContain(`Error: "netlifyConfig.plugins" is read-only.`)
})

test('netlifyConfig.processing can be assigned all at once', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/processing_all').runWithBuild()
  expect(output).toContain(`Netlify configuration property "build.processing.css.bundle" value changed to true.`)
})

test('netlifyConfig.processing can be assigned individually', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/processing_prop').runWithBuild()
  expect(output).toContain(`Netlify configuration property "build.processing.css.bundle" value changed to true.`)
})

test('netlifyConfig.build.command can be changed', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_command_change').runWithBuild()
  expect(output).toContain(`Netlify configuration property "build.command" value changed to 'node --version'.`)
})

test('netlifyConfig.build.command can be added', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_command_add').runWithBuild()
  expect(output).toContain(`Netlify configuration property "build.command" value changed to 'node --version'.`)
})

test.skipIf(os.platform() === 'win32')('netlifyConfig.build.command can be removed', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/build_command_remove').runWithBuild()
  expect(output).toContain(`Netlify configuration property "build.command" value changed to ''.`)
})

test('netlifyConfig.build.environment can be assigned all at once', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/env_all').runWithBuild()
  expect(output).toContain(`Netlify configuration property "build.environment.TEST_TWO" value changed.`)
})

test('netlifyConfig.build.environment can be assigned individually', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/env_prop').runWithBuild()
  expect(output).toContain(`Netlify configuration property "build.environment.TEST_TWO" value changed.`)
})

test.skipIf(os.platform() === 'win32')(
  'netlifyConfig.build.publish mutations are used by constants.PUBLISH_DIR',
  async () => {
    const output = await new Fixture(import.meta.url, './fixtures/publish_constants').runWithBuild()
    expect(output).toContain(`Netlify configuration property "build.publish" value changed to 'test'.`)
  },
)

test('netlifyConfig.build.edge_functions mutations are used by constants.EDGE_FUNCTIONS_SRC', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/edge_functions_constants')
    .withFlags({ debug: false })
    .runWithBuild()
  expect(output).toContain(`Netlify configuration property "build.edge_functions" value changed to 'test'.`)
})

test.skipIf(os.platform() === 'win32')('netlifyConfig.edge_functions can be assigned all at once', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/edge_functions_all')
    .withFlags({ debug: false })
    .runWithBuild()
  expect(output).toContain(`Netlify Build Complete`)
})

test('netlifyConfig.services can be assigned all at once', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/services_all').runWithBuild()
  expect(output).toContain(`Netlify configuration property "build.services.identity" value changed to 'two'.`)
})

test('netlifyConfig.services can be assigned individually', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/services_prop').runWithBuild()
  expect(output).toContain(`Netlify configuration property "build.services.identity" value changed to 'two'.`)
})

test('netlifyConfig mutations fail if done in an event that is too late', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/too_late').runWithBuild()
  expect(output).toContain(`Error: "netlifyConfig.build.command" cannot be modified after "onPreBuild".`)
})

test('netlifyConfig mutations fail correctly on symbols', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/symbol').runWithBuild()
  expect(output).toContain(`Netlify Build completed`)
})

test('netlifyConfig mutations fail if the syntax is invalid', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/invalid_syntax').runWithBuild()
  expect(output).toContain(`Configuration property build.command must be a string`)
})
