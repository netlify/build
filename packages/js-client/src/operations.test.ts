import test from 'ava'

import { getOperations } from './operations.js'

test('Exported methods', (t) => {
  t.snapshot(getOperations())
})
