const test = require('ava')

const { getFrameworks, getFramework, hasFramework } = require('./helpers/main')

test('Should detect frameworks', async (t) => {
  const frameworks = await getFrameworks('simple')
  t.snapshot(frameworks)
})

test('Should return an empty array when no framework is detected', async (t) => {
  const frameworks = await getFrameworks('empty')
  t.is(frameworks.length, 0)
})

test('Should return several items when multiple frameworks are detected', async (t) => {
  const frameworks = await getFrameworks('multiple')
  t.is(frameworks.length, 2)
})

test('Should allow getting a specific framework', async (t) => {
  const framework = await getFramework('simple', 'sapper')
  t.snapshot(framework)
})

test('Should throw when passing an invalid framework', async (t) => {
  await t.throwsAsync(getFramework('simple', 'doesNotExist'))
})

test('Should allow testing a specific framework', async (t) => {
  const trueResult = await hasFramework('simple', 'sapper')
  t.true(trueResult)

  const falseResult = await hasFramework('simple', 'nuxt')
  t.false(falseResult)
})

test('Should throw when testing an invalid framework', async (t) => {
  await t.throwsAsync(hasFramework('simple', 'doesNotExist'))
})

test('Should sort framework ids in invalid framework error message', async (t) => {
  const error = await t.throwsAsync(hasFramework('simple', 'doesNotExist'))

  // we don't use a hardcoded string here, since it will change when a new framework is added
  const [, frameworksFromMessage] = error.message.match(/It should be one of: (.+)/)
  const frameworksArray = frameworksFromMessage.split(', ')

  t.deepEqual(frameworksArray, [...frameworksArray].sort())
})
