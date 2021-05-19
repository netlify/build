const test = require('ava')

const { getFrameworks } = require('./helpers/main')

test('Should use Yarn when there is a yarn.lock', async (t) => {
  const frameworks = await getFrameworks('yarn_scripts')
  t.is(frameworks.length, 1)
  t.deepEqual(frameworks[0].dev.commands, ['yarn dev', 'yarn start'])
})
