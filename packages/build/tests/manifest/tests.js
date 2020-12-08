'use strict'

const test = require('ava')

const { runFixture } = require('../helpers/main')

test('manifest.yml check required inputs', async (t) => {
  await runFixture(t, 'required')
})

test('manifest.yml check unknown property when plugin has none', async (t) => {
  await runFixture(t, 'unknown_none')
})

test('manifest.yml check unknown property when plugin has some', async (t) => {
  await runFixture(t, 'unknown_some')
})

test('manifest.yml check default value', async (t) => {
  await runFixture(t, 'default')
})

test('manifest.yml same directory', async (t) => {
  await runFixture(t, 'same_directory')
})

test('manifest.yml root directory', async (t) => {
  await runFixture(t, 'root_directory')
})

test('manifest.yml not root directory', async (t) => {
  await runFixture(t, 'not_root_directory')
})

test('manifest.yml missing', async (t) => {
  await runFixture(t, 'missing')
})

test('manifest.yml parse error', async (t) => {
  await runFixture(t, 'parse_error')
})

test('manifest.yml advanced YAML', async (t) => {
  await runFixture(t, 'advanced_yaml')
})

test('manifest.yml plain object', async (t) => {
  await runFixture(t, 'plain_object')
})

test('manifest.yml unknown properties', async (t) => {
  await runFixture(t, 'manifest_unknown')
})

test('manifest.yml name undefined', async (t) => {
  await runFixture(t, 'name_undefined')
})

test('manifest.yml name is a string', async (t) => {
  await runFixture(t, 'name_string')
})

test('manifest.yml inputs array', async (t) => {
  await runFixture(t, 'inputs_array')
})

test('manifest.yml inputs array of objects', async (t) => {
  await runFixture(t, 'inputs_array_objects')
})

test('manifest.yml inputs unknown property', async (t) => {
  await runFixture(t, 'inputs_unknown')
})

test('manifest.yml inputs name is undefined', async (t) => {
  await runFixture(t, 'inputs_name_undefined')
})

test('manifest.yml inputs name is string', async (t) => {
  await runFixture(t, 'inputs_name_string')
})

test('manifest.yml inputs description is a string', async (t) => {
  await runFixture(t, 'inputs_description_string')
})

test('manifest.yml inputs required is a boolean', async (t) => {
  await runFixture(t, 'inputs_required_boolean')
})

test('manifest.yml node module', async (t) => {
  await runFixture(t, 'module')
})

test('manifest.yaml is a valid filename', async (t) => {
  await runFixture(t, 'manifest_yaml')
})
