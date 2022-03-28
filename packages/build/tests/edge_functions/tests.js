import test from 'ava'

import { runFixture } from '../helpers/main.js'

test('constants.EDGE_FUNCTIONS_SRC default value', async (t) => {
  await runFixture(t, 'src_default')
})

test.skip('constants.EDGE_FUNCTIONS_SRC automatic value', async (t) => {
  await runFixture(t, 'src_auto')
})

test.skip('constants.EDGE_FUNCTIONS_SRC relative path', async (t) => {
  await runFixture(t, 'src_relative')
})

test.skip('constants.EDGE_FUNCTIONS_SRC missing path', async (t) => {
  await runFixture(t, 'src_missing')
})

test.skip('constants.EDGE_FUNCTIONS_SRC created dynamically', async (t) => {
  await runFixture(t, 'src_dynamic', { copyRoot: { git: false } })
})

test.skip('constants.EDGE_FUNCTIONS_SRC dynamic is ignored if EDGE_FUNCTIONS_SRC is specified', async (t) => {
  await runFixture(t, 'src_dynamic_ignore', { copyRoot: { git: false } })
})

test.skip('constants.EDGE_FUNCTIONS_DIST default value', async (t) => {
  await runFixture(t, 'print_dist')
})

test.skip('constants.EDGE_FUNCTIONS_DIST custom value', async (t) => {
  await runFixture(t, 'print_dist', { flags: { mode: 'buildbot', edgeHandlersDistDir: '/another/path' } })
})
