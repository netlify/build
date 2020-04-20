const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('build.command uses Bash', async t => {
  await runFixture(t, 'bash')
})
