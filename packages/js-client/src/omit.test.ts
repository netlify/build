import test from 'ava'

import omit from './omit.js'

test('creates a shallow copy', (t) => {
  const obj = { name: 'Benjy' }
  const copy = omit(obj, [])
  t.not(obj, copy)
  t.deepEqual(obj, copy)
})

test('returns an object without the specified fields', (t) => {
  const obj = { name: 'Benjy', age: 18 }
  t.deepEqual(omit(obj, ['age']), { name: 'Benjy' })
  t.deepEqual(omit(obj, ['name', 'age']), {})
})
