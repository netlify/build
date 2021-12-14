'use strict'

const test = require('ava')
const { spy } = require('sinon')

const { removeDir } = require('../helpers/dir')
const { runFixture, FIXTURES_DIR } = require('../helpers/main')

const EDGE_HANDLERS_LOCAL_DIR = '.netlify/edge-handlers'
const EDGE_HANDLERS_MANIFEST = 'manifest.json'

const getEdgeHandlersPaths = function (fixtureName) {
  const outputDir = `${FIXTURES_DIR}/${fixtureName}/${EDGE_HANDLERS_LOCAL_DIR}`
  const manifestPath = `${outputDir}/${EDGE_HANDLERS_MANIFEST}`
  return { outputDir, manifestPath }
}

const loadEdgeHandlerBundle = async function ({ outputDir, manifestPath }) {
  const bundlePath = getEdgeHandlerBundlePath({ outputDir, manifestPath })

  try {
    return requireEdgeHandleBundle(bundlePath)
  } finally {
    await removeDir(bundlePath)
  }
}

const getEdgeHandlerBundlePath = function ({ outputDir, manifestPath }) {
  // eslint-disable-next-line node/global-require, import/no-dynamic-require
  const { sha } = require(manifestPath)
  return `${outputDir}/${sha}`
}

const requireEdgeHandleBundle = function (bundlePath) {
  const set = spy()
  global.netlifyRegistry = { set }
  // eslint-disable-next-line node/global-require, import/no-dynamic-require
  require(bundlePath)
  delete global.netlifyRegistry
  return set.args.map(normalizeEdgeHandler)
}

const normalizeEdgeHandler = function ([handlerName, { onRequest }]) {
  return { handlerName, onRequest }
}

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

test('Edge handlers: simple setup', async (t) => {
  const { outputDir, manifestPath } = getEdgeHandlersPaths('simple')
  await runFixture(t, 'simple')

  const [{ handlerName, onRequest }] = await loadEdgeHandlerBundle({ outputDir, manifestPath })
  t.is(handlerName, 'test')
  t.deepEqual(onRequest('test'), [true, 'test', 'test'])
})

test('Edge handlers: can configure directory', async (t) => {
  const { outputDir, manifestPath } = getEdgeHandlersPaths('custom_dir')
  await runFixture(t, 'custom_dir')

  const [{ handlerName }] = await loadEdgeHandlerBundle({ outputDir, manifestPath })
  t.is(handlerName, 'test')
})
