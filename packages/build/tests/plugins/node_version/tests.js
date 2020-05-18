const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('Validate --node-path version is supported by our codebase', async t => {
  await runFixture(t, 'simple', { flags: '--node-path=/home/ether/.nvm/versions/node/v8.2.0/bin/node' })
})

test('Validate --node-path unsupported version does not fail when no plugins are used', async t => {
  await runFixture(t, 'empty', { flags: '--node-path=/home/ether/.nvm/versions/node/v8.2.0/bin/node' })
})

test('Validate --node-path version is supported by the plugin', async t => {
  await runFixture(t, 'engines', { flags: '--node-path=/home/ether/.nvm/versions/node/v9.0.0/bin/node' })
})

test('Validate --node-path', async t => {
  await runFixture(t, 'simple', { flags: '--node-path=/doesNotExist' })
})
