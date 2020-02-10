const test = require('ava')
const del = require('del')

const { runFixture, FIXTURES_DIR } = require('../../helpers/main')

// TODO: enable tests once functions-utils is stable
test.skip('functions-utils simple', async t => {
  await del(`${FIXTURES_DIR}/simple/functions/`)
  await runFixture(t, 'simple')
  await del(`${FIXTURES_DIR}/simple/functions/`)
})

test.skip('functions-utils directory', async t => {
  await del(`${FIXTURES_DIR}/directory/functions/`)
  await runFixture(t, 'directory')
  await del(`${FIXTURES_DIR}/directory/functions/`)
})

test.skip('functions-utils missing', async t => {
  await runFixture(t, 'missing')
})

test.skip('functions-utils already existing', async t => {
  await runFixture(t, 'already')
})
