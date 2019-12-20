const test = require('ava')
const del = require('del')

const { runFixture, FIXTURES_DIR } = require('../../helpers/main')

test('functions-utils simple', async t => {
  await del(`${FIXTURES_DIR}/simple/functions/`)
  await runFixture(t, 'simple')
  await del(`${FIXTURES_DIR}/simple/functions/`)
})

test('functions-utils directory', async t => {
  await del(`${FIXTURES_DIR}/directory/functions/`)
  await runFixture(t, 'directory')
  await del(`${FIXTURES_DIR}/directory/functions/`)
})

test('functions-utils missing', async t => {
  await runFixture(t, 'missing')
})

test('functions-utils already existing', async t => {
  await runFixture(t, 'already')
})
