import { promises as fs } from 'fs'
import { pathToFileURL } from 'url'

import test from 'ava'
import { spy } from 'sinon'

import { importJsonFile } from '../../src/utils/json.js'
import { removeDir } from '../helpers/dir.js'
import { runFixture, FIXTURES_DIR } from '../helpers/main.js'

const EDGE_HANDLERS_LOCAL_DIR = '.netlify/edge-handlers'
const EDGE_HANDLERS_MANIFEST = 'manifest.json'

const getEdgeHandlersPaths = function (fixtureName) {
  const outputDir = `${FIXTURES_DIR}/${fixtureName}/${EDGE_HANDLERS_LOCAL_DIR}`
  const manifestPath = `${outputDir}/${EDGE_HANDLERS_MANIFEST}`
  return { outputDir, manifestPath }
}

const loadEdgeHandlerBundle = async function ({ outputDir, manifestPath }) {
  const bundlePath = await getEdgeHandlerBundlePath({ outputDir, manifestPath })

  try {
    return await requireEdgeHandleBundle(bundlePath)
  } finally {
    await removeDir(bundlePath)
  }
}

const getEdgeHandlerBundlePath = async function ({ outputDir, manifestPath }) {
  const { sha } = await importJsonFile(manifestPath)
  return `${outputDir}/${sha}`
}

const requireEdgeHandleBundle = async function (bundlePath) {
  const set = spy()
  global.netlifyRegistry = { set }
  const bundlePathWithExt = `${bundlePath}.js`
  await fs.rename(bundlePath, bundlePathWithExt)
  await import(pathToFileURL(bundlePathWithExt))
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

test('constants.EDGE_HANDLERS_DIST default value', async (t) => {
  await runFixture(t, 'print_dist')
})

test('constants.EDGE_HANDLERS_DIST custom value', async (t) => {
  await runFixture(t, 'print_dist', { flags: { mode: 'buildbot', edgeHandlersDistDir: '/another/path' } })
})

// loadEdgeHandlerBundle modifies the global object, so we need to run tests that use it in serial
test.serial('Edge handlers: simple setup', async (t) => {
  const { outputDir, manifestPath } = getEdgeHandlersPaths('simple')
  await runFixture(t, 'simple')

  const [{ handlerName, onRequest }] = await loadEdgeHandlerBundle({ outputDir, manifestPath })
  t.is(handlerName, 'test')
  t.deepEqual(onRequest('test'), [true, 'test', 'test'])
})

// loadEdgeHandlerBundle modifies the global object, so we need to run tests that use it in serial
test.serial('Edge handlers: can configure directory', async (t) => {
  const { outputDir, manifestPath } = getEdgeHandlersPaths('custom_dir')
  await runFixture(t, 'custom_dir')

  const [{ handlerName }] = await loadEdgeHandlerBundle({ outputDir, manifestPath })
  t.is(handlerName, 'test')
})
