const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('plugin.event is renamed to plugin.onEvent', async t => {
  await runFixture(t, 'event_name')
})
