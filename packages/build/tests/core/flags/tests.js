const { execPath } = require('process')

const test = require('ava')
const getNode = require('get-node')

const { runFixture, FIXTURES_DIR } = require('../../helpers/main')

const CHILD_NODE_VERSION = '8.3.0'
const VERY_OLD_NODE_VERSION = '4.0.0'

test('--node-path is used by build.command', async t => {
  const { path } = await getNode(CHILD_NODE_VERSION)
  await runFixture(t, 'build_command', { flags: `--node-path=${path}`, env: { TEST_NODE_PATH: path } })
})

test('--node-path is used by local plugins', async t => {
  const { path } = await getNode(CHILD_NODE_VERSION)
  await runFixture(t, 'local', { flags: `--node-path=${path}`, env: { TEST_NODE_PATH: path } })
})

test('--node-path is used by plugins added to package.json', async t => {
  const { path } = await getNode(CHILD_NODE_VERSION)
  await runFixture(t, 'package', { flags: `--node-path=${path}`, env: { TEST_NODE_PATH: path } })
})

test('--node-path is not used by core plugins', async t => {
  const { path } = await getNode(VERY_OLD_NODE_VERSION)
  await runFixture(t, 'core', { flags: `--node-path=${path}` })
})

test('--node-path is not used by build-image cached plugins', async t => {
  const { path } = await getNode(CHILD_NODE_VERSION)
  await runFixture(t, 'build_image', {
    flags: `--node-path=${path} --mode=buildbot`,
    env: { TEST_NODE_PATH: execPath, TEST_BUILD_IMAGE_PLUGINS_DIR: `${FIXTURES_DIR}/build_image_cache/node_modules` },
  })
})
