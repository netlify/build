const test = require('ava')

const { runFixture } = require('../../helpers/main')

const getNodePath = function(version) {
  return `/home/ether/.nvm/versions/node/v${version}/bin/node`
}

test('Validate --node-path version is supported by our codebase', async t => {
  const nodePath = getNodePath('8.2.0')
  await runFixture(t, 'simple', { flags: { nodePath } })
})

test('Validate --node-path unsupported version does not fail when no plugins are used', async t => {
  const nodePath = getNodePath('8.2.0')
  await runFixture(t, 'empty', { flags: { nodePath } })
})

test('Validate --node-path version is supported by the plugin', async t => {
  const nodePath = getNodePath('9.0.0')
  await runFixture(t, 'engines', { flags: { nodePath } })
})

test('Validate --node-path', async t => {
  await runFixture(t, 'simple', { flags: { nodePath: '/doesNotExist' } })
})
