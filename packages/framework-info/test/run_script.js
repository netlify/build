import test from 'ava'

import { getFrameworks } from './helpers/main.js'

test('Should use Yarn when there is a yarn.lock', async (t) => {
  const frameworks = await getFrameworks('yarn_scripts')
  t.is(frameworks.length, 1)
  t.deepEqual(frameworks[0].dev.commands, ['yarn dev', 'yarn start'])
})
