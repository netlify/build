import os from 'os'

import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'

test('Pass netlifyConfig to plugins', async (t) => {
  const output = await new Fixture('./fixtures/valid').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('netlifyConfig properties are readonly (set) by default', async (t) => {
  const output = await new Fixture('./fixtures/readonly_set').runWithBuild()
  t.true(output.includes(` Error: "netlifyConfig.build.ignore" is read-only.`))
})

test('netlifyConfig properties are readonly (delete) by default', async (t) => {
  const output = await new Fixture('./fixtures/readonly_delete').runWithBuild()
  t.true(output.includes(`Error: Setting "netlifyConfig.build.command" to undefined is not allowed.`))
})

test('netlifyConfig properties are readonly (defineProperty) by default', async (t) => {
  const output = await new Fixture('./fixtures/readonly_define').runWithBuild()
  t.true(output.includes(`Error: "netlifyConfig.build.ignore" is read-only.`))
})

test('Some netlifyConfig properties can be mutated', async (t) => {
  const output = await new Fixture('./fixtures/general').runWithBuild()
  t.true(output.includes(`Netlify configuration property "functions.directory" value changed to 'test_functions'.`))
})

test('netlifyConfig properties cannot be deleted', async (t) => {
  const output = await new Fixture('./fixtures/delete').runWithBuild()
  t.true(output.includes(`Error: Setting "netlifyConfig.build.command" to undefined is not allowed.`))
})

test('netlifyConfig properties cannot be assigned to undefined', async (t) => {
  const output = await new Fixture('./fixtures/set_undefined').runWithBuild()
  t.true(output.includes(`Error: Setting "netlifyConfig.build.command" to undefined is not allowed.`))
})

test('netlifyConfig properties cannot be assigned to null', async (t) => {
  const output = await new Fixture('./fixtures/set_null').runWithBuild()
  t.true(output.includes(`Error: Setting "netlifyConfig.build.command" to null is not allowed.`))
})

test('netlifyConfig properties cannot be assigned to undefined with defineProperty', async (t) => {
  const output = await new Fixture('./fixtures/define_undefined').runWithBuild()
  t.true(output.includes(`Error: Setting "netlifyConfig.build.command" to undefined is not allowed.`))
})

test('netlifyConfig properties mutations is persisted', async (t) => {
  const output = await new Fixture('./fixtures/persist').runWithBuild()
  t.true(output.includes(`Netlify configuration property "build.command" value changed to 'node --version'.`))
})

test('netlifyConfig array properties can be mutated per index', async (t) => {
  const output = await new Fixture('./fixtures/array_index').runWithBuild()
  t.true(
    output.includes(`Netlify configuration property "functions.*.included_files" value changed to [ 'one', 'two' ].`),
  )
})

test('netlifyConfig array properties can be pushed', async (t) => {
  const output = await new Fixture('./fixtures/array_push').runWithBuild()
  t.true(
    output.includes(`Netlify configuration property "functions.*.included_files" value changed to [ 'one', 'two' ].`),
  )
})

test('netlifyConfig.functionsDirectory mutations are used during functions bundling', async (t) => {
  const output = await new Fixture('./fixtures/functions_directory_bundling').runWithBuild()
  t.true(output.includes(`Netlify configuration property "functions.directory" value changed to 'test_functions'.`))
})

test('netlifyConfig.functionsDirectory deletion skips functions bundling', async (t) => {
  const output = await new Fixture('./fixtures/functions_directory_skip').runWithBuild()
  t.true(output.includes(`Netlify configuration property "functions.directory" value changed to ''.`))
})

test('netlifyConfig.functionsDirectory mutations are used by utils.functions', async (t) => {
  const output = await new Fixture('./fixtures/functions_directory_utils').runWithBuild()
  t.true(output.includes(`Netlify configuration property "functions.directory" value changed to 'test_functions'.`))
})

test('netlifyConfig.functionsDirectory mutations are used by constants.FUNCTIONS_SRC', async (t) => {
  const output = await new Fixture('./fixtures/functions_directory_constants').runWithBuild()
  t.true(output.includes(`Netlify configuration property "functions.directory" value changed to 'test_functions'.`))
})

test('netlifyConfig.functionsDirectory mutations are taken into account by default constants.FUNCTIONS_SRC', async (t) => {
  const output = await new Fixture('./fixtures/functions_directory_default').runWithBuild()
  t.true(output.includes(`Netlify configuration property "functions.directory" value changed to 'test_functions'.`))
})

test('netlifyConfig.functions.star.directory mutations work', async (t) => {
  const output = await new Fixture('./fixtures/functions_directory_star').runWithBuild()
  t.true(output.includes(`Netlify configuration property "functions.*.directory" value changed to 'test_functions'.`))
})

test('netlifyConfig.functions.star.directory has priority over functions.directory', async (t) => {
  const output = await new Fixture('./fixtures/functions_directory_star_priority').runWithBuild()
  t.true(output.includes(`Netlify configuration property "functions.*.directory" value changed to 'test_functions'.`))
})

test('netlifyConfig.functions.directory mutations work', async (t) => {
  const output = await new Fixture('./fixtures/functions_directory_nested').runWithBuild()
  t.true(output.includes(`Netlify configuration property "functions.directory" value changed to 'test_functions'.`))
})

test('netlifyConfig.functions.directory has priority over functions.star.directory', async (t) => {
  const output = await new Fixture('./fixtures/functions_directory_nested_priority').runWithBuild()
  t.true(output.includes(`Netlify configuration property "functions.directory" value changed to 'test_functions'.`))
})

test('netlifyConfig.build.functions mutations work', async (t) => {
  const output = await new Fixture('./fixtures/functions_directory_build').runWithBuild()
  t.true(output.includes(`Netlify configuration property "build.functions" value changed to 'test_functions'.`))
})

test('netlifyConfig.functions mutations are used during functions bundling', async (t) => {
  const output = await new Fixture('./fixtures/functions_bundling').runWithBuild()
  t.true(output.includes(`Netlify configuration property "functions.test.node_bundler" value changed to 'zisi'.`))
})

test('netlifyConfig.functions mutations on any property can be used', async (t) => {
  const output = await new Fixture('./fixtures/functions_any').runWithBuild()
  t.true(output.includes(`Netlify configuration property "functions.test.external_node_modules" value changed to [].`))
})

test('netlifyConfig.functions mutations can add new functions configs', async (t) => {
  const output = await new Fixture('./fixtures/functions_new').runWithBuild()
  t.true(output.includes(`Netlify configuration property "functions.test" value changed to { included_files: [] }.`))
})

test('netlifyConfig.functions mutations are only logged in debug mode', async (t) => {
  const output = await new Fixture('./fixtures/functions_no_log_debug').withFlags({ debug: false }).runWithBuild()
  t.false(output.includes(`Netlify configuration property "functions.test" value changed to { included_files: [] }.`))
})

test('netlifyConfig properties are deeply readonly by default', async (t) => {
  const output = await new Fixture('./fixtures/readonly_deep').runWithBuild()
  t.true(output.includes(`Error: "netlifyConfig.plugins" is read-only.`))
})

test('netlifyConfig.processing can be assigned all at once', async (t) => {
  const output = await new Fixture('./fixtures/processing_all').runWithBuild()
  t.true(output.includes(`Netlify configuration property "build.processing.css.bundle" value changed to true.`))
})

test('netlifyConfig.processing can be assigned individually', async (t) => {
  const output = await new Fixture('./fixtures/processing_prop').runWithBuild()
  t.true(output.includes(`Netlify configuration property "build.processing.css.bundle" value changed to true.`))
})

test('netlifyConfig.build.command can be changed', async (t) => {
  const output = await new Fixture('./fixtures/build_command_change').runWithBuild()
  t.true(output.includes(`Netlify configuration property "build.command" value changed to 'node --version'.`))
})

test('netlifyConfig.build.command can be added', async (t) => {
  const output = await new Fixture('./fixtures/build_command_add').runWithBuild()
  t.true(output.includes(`Netlify configuration property "build.command" value changed to 'node --version'.`))
})

test('netlifyConfig.build.command can be removed', async (t) => {
  if (os.platform() === 'win32') {
    t.log('Test skipped on Windows.')
    t.pass()
    return
  }
  const output = await new Fixture('./fixtures/build_command_remove').runWithBuild()
  t.true(output.includes(`Netlify configuration property "build.command" value changed to ''.`))
})

test('netlifyConfig.build.environment can be assigned all at once', async (t) => {
  const output = await new Fixture('./fixtures/env_all').runWithBuild()
  t.true(output.includes(`Netlify configuration property "build.environment.TEST_TWO" value changed.`))
})

test('netlifyConfig.build.environment can be assigned individually', async (t) => {
  const output = await new Fixture('./fixtures/env_prop').runWithBuild()
  t.true(output.includes(`Netlify configuration property "build.environment.TEST_TWO" value changed.`))
})

test('netlifyConfig.build.publish mutations are used by constants.PUBLISH_DIR', async (t) => {
  if (os.platform() === 'win32') {
    t.log('Test skipped on Windows.')
    t.pass()
    return
  }
  const output = await new Fixture('./fixtures/publish_constants').runWithBuild()
  t.true(output.includes(`Netlify configuration property "build.publish" value changed to 'test'.`))
})

test('netlifyConfig.build.edge_functions mutations are used by constants.EDGE_FUNCTIONS_SRC', async (t) => {
  const output = await new Fixture('./fixtures/edge_functions_constants').withFlags({ debug: false }).runWithBuild()
  t.true(output.includes(`Netlify configuration property "build.edge_functions" value changed to 'test'.`))
})

test('netlifyConfig.edge_functions can be assigned all at once', async (t) => {
  if (os.platform() === 'win32') {
    t.log('Test skipped on Windows.')
    t.pass()
    return
  }
  const output = await new Fixture('./fixtures/edge_functions_all').withFlags({ debug: false }).runWithBuild()
  t.true(output.includes(`Netlify Build Complete`))
})

test('netlifyConfig.services can be assigned all at once', async (t) => {
  const output = await new Fixture('./fixtures/services_all').runWithBuild()
  t.true(output.includes(`Netlify configuration property "build.services.identity" value changed to 'two'.`))
})

test('netlifyConfig.services can be assigned individually', async (t) => {
  const output = await new Fixture('./fixtures/services_prop').runWithBuild()
  t.true(output.includes(`Netlify configuration property "build.services.identity" value changed to 'two'.`))
})

test('netlifyConfig mutations fail if done in an event that is too late', async (t) => {
  const output = await new Fixture('./fixtures/too_late').runWithBuild()
  t.true(output.includes(`Error: "netlifyConfig.build.command" cannot be modified after "onPreBuild".`))
})

test('netlifyConfig mutations fail correctly on symbols', async (t) => {
  const output = await new Fixture('./fixtures/symbol').runWithBuild()
  t.true(output.includes(`Netlify Build completed`))
})

test('netlifyConfig mutations fail if the syntax is invalid', async (t) => {
  const output = await new Fixture('./fixtures/invalid_syntax').runWithBuild()
  t.true(output.includes(`Configuration property build.command must be a string`))
})
