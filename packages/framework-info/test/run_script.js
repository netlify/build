const test = require('ava')

const { getFrameworks } = require('./helpers/main.js')

test('Should use Yarn when there is a yarn.lock', async t => {
  const frameworks = await getFrameworks('yarn_scripts')
  t.is(frameworks.length, 1)
  t.deepEqual(frameworks[0].watch.commands, ['yarn start', 'yarn dev'])
})
