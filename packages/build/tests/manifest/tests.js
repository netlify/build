import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'

test('manifest.yml check required inputs', async (t) => {
  const output = await new Fixture('./fixtures/required').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('manifest.yml check unknown property when plugin has none', async (t) => {
  const output = await new Fixture('./fixtures/unknown_none').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('manifest.yml check unknown property when plugin has some', async (t) => {
  const output = await new Fixture('./fixtures/unknown_some').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('manifest.yml check default value', async (t) => {
  const output = await new Fixture('./fixtures/default').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('manifest.yml same directory', async (t) => {
  const output = await new Fixture('./fixtures/same_directory').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('manifest.yml root directory', async (t) => {
  const output = await new Fixture('./fixtures/root_directory').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('manifest.yml not root directory', async (t) => {
  const output = await new Fixture('./fixtures/not_root_directory').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('manifest.yml missing', async (t) => {
  const output = await new Fixture('./fixtures/missing').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('manifest.yml parse error', async (t) => {
  const output = await new Fixture('./fixtures/parse_error').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('manifest.yml advanced YAML', async (t) => {
  const output = await new Fixture('./fixtures/advanced_yaml').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('manifest.yml plain object', async (t) => {
  const output = await new Fixture('./fixtures/plain_object').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('manifest.yml unknown properties', async (t) => {
  const output = await new Fixture('./fixtures/manifest_unknown').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('manifest.yml name undefined', async (t) => {
  const output = await new Fixture('./fixtures/name_undefined').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('manifest.yml name is a string', async (t) => {
  const output = await new Fixture('./fixtures/name_string').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('manifest.yml inputs array', async (t) => {
  const output = await new Fixture('./fixtures/inputs_array').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('manifest.yml inputs array of objects', async (t) => {
  const output = await new Fixture('./fixtures/inputs_array_objects').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('manifest.yml inputs unknown property', async (t) => {
  const output = await new Fixture('./fixtures/inputs_unknown').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('manifest.yml inputs name is undefined', async (t) => {
  const output = await new Fixture('./fixtures/inputs_name_undefined').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('manifest.yml inputs name is string', async (t) => {
  const output = await new Fixture('./fixtures/inputs_name_string').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('manifest.yml inputs description is a string', async (t) => {
  const output = await new Fixture('./fixtures/inputs_description_string').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('manifest.yml inputs required is a boolean', async (t) => {
  const output = await new Fixture('./fixtures/inputs_required_boolean').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('manifest.yml node module', async (t) => {
  const output = await new Fixture('./fixtures/module').runWithBuild()
  t.snapshot(normalizeOutput(output))
})

test('manifest.yaml is a valid filename', async (t) => {
  const output = await new Fixture('./fixtures/manifest_yaml').runWithBuild()
  t.snapshot(normalizeOutput(output))
})
