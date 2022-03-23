import test from 'ava'

import { runFixture } from '../helpers/main.js'

test('constants.EDGE_HANDLERS_SRC default value', async (t) => {
  await runFixture(t, 'src_default')
})

test('constants.EDGE_HANDLERS_SRC automatic value', async (t) => {
  await runFixture(t, 'src_auto')
})

test('constants.EDGE_HANDLERS_SRC relative path', async (t) => {
  await runFixture(t, 'src_relative')
})

test('constants.EDGE_HANDLERS_SRC missing path', async (t) => {
  await runFixture(t, 'src_missing')
})

test('constants.EDGE_HANDLERS_SRC created dynamically', async (t) => {
  await runFixture(t, 'src_dynamic', { copyRoot: { git: false } })
})

test('constants.EDGE_HANDLERS_SRC dynamic is ignored if EDGE_HANDLERS_SRC is specified', async (t) => {
  await runFixture(t, 'src_dynamic_ignore', { copyRoot: { git: false } })
})

test('constants.EDGE_HANDLERS_DIST default value', async (t) => {
  await runFixture(t, 'print_dist')
})

test('constants.EDGE_HANDLERS_DIST custom value', async (t) => {
  await runFixture(t, 'print_dist', { flags: { mode: 'buildbot', edgeHandlersDistDir: '/another/path' } })
})
