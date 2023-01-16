import { expect, test } from 'vitest'

import { getFrameworks } from './helpers/main.js'

test('Should use Yarn when there is a yarn.lock', async () => {
  const frameworks = await getFrameworks('yarn_scripts')
  expect(frameworks).toHaveLength(1)
  expect(frameworks[0].dev.commands).toEqual(['yarn dev', 'yarn start'])
})
