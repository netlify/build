const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('manifest.yml check required inputs', async t => {
  await runFixture(t, 'required')
})

test('manifest.yml check unknown property', async t => {
  await runFixture(t, 'unknown')
})

test('manifest.yml check default value', async t => {
  await runFixture(t, 'default')
})
