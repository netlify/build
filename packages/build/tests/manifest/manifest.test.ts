import { Fixture, normalizeOutput } from '@netlify/testing'
import { expect, test } from 'vitest'

test('manifest.yml check required inputs', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/required').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('manifest.yml check unknown property when plugin has none', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/unknown_none').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('manifest.yml check unknown property when plugin has some', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/unknown_some').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('manifest.yml check default value', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/default').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('manifest.yml same directory', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/same_directory').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('manifest.yml root directory', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/root_directory').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('manifest.yml not root directory', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/not_root_directory').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('manifest.yml missing', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/missing').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('manifest.yml parse error', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/parse_error').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('manifest.yml advanced YAML', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/advanced_yaml').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('manifest.yml plain object', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/plain_object').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('manifest.yml unknown properties', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/manifest_unknown').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('manifest.yml name undefined', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/name_undefined').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('manifest.yml name is a string', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/name_string').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('manifest.yml inputs array', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/inputs_array').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('manifest.yml inputs array of objects', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/inputs_array_objects').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('manifest.yml inputs unknown property', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/inputs_unknown').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('manifest.yml inputs name is undefined', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/inputs_name_undefined').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('manifest.yml inputs name is string', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/inputs_name_string').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('manifest.yml inputs description is a string', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/inputs_description_string').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('manifest.yml inputs required is a boolean', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/inputs_required_boolean').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('manifest.yml node module', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/module').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})

test('manifest.yaml is a valid filename', async () => {
  const output = await new Fixture(import.meta.url, './fixtures/manifest_yaml').runWithBuild()
  expect(normalizeOutput(output)).toMatchSnapshot()
})
