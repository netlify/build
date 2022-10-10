import test from 'ava'

import { getOperations } from '../lib/operations.js'

test('Exported methods', (t) => {
  t.snapshot(getOperations())
})
