const test = require('ava')
const getNode = require('get-node')

const { runFixture } = require('../../helpers/main')

const CHILD_NODE_VERSION = '8.3.0'
const VERY_OLD_NODE_VERSION = '4.0.0'

test('--node-path is used by build.command and Build plugins', async t => {
  const { path } = await getNode(CHILD_NODE_VERSION)
  await runFixture(t, 'node_version', { flags: `--node-path=${path}`, env: { TEST_NODE_PATH: path } })
})

test('--node-path is not used by core plugins', async t => {
  const { path } = await getNode(VERY_OLD_NODE_VERSION)
  await runFixture(t, 'core_plugin', { flags: `--node-path=${path}` })
})
