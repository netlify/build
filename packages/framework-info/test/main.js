const test = require('ava')

const { getFrameworks, getFramework } = require('./helpers/main.js')

test('Should detect frameworks', async t => {
  const frameworks = await getFrameworks('simple')
  t.snapshot(frameworks)
})

test('Should return an empty array when no framework is detected', async t => {
  const frameworks = await getFrameworks('empty')
  t.is(frameworks.length, 0)
})

test('Should return several items when multiple frameworks are detected', async t => {
  const frameworks = await getFrameworks('multiple')
  t.is(frameworks.length, 2)
})

test('Should allow getting a specific framework', async t => {
  const framework = await getFramework('simple', 'sapper')
  t.snapshot(framework)
})

test('Should throw when passing an inva;lid framework', async t => {
  await t.throwsAsync(getFramework('simple', 'doesNotExist'))
})
