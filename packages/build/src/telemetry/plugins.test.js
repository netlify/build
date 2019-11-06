const test = require('ava')

const activePlugins = require('./plugins')

test('Plugins should be empty when BUILD_TELEMETRY_DISABLED env set', async t => {
  t.deepEqual(activePlugins, [])
})
