import { expect, test } from 'vitest'

import omit from './omit.js'

test('creates a shallow copy', () => {
  const obj = { name: 'Benjy' }
  const copy = omit(obj, [])
  expect(obj).not.toBe(copy)
  expect(obj).toEqual(copy)
})

test('returns an object without the specified fields', () => {
  const obj = { name: 'Benjy', age: 18 }
  expect(omit(obj, ['age'])).toEqual({ name: 'Benjy' })
  expect(omit(obj, ['name', 'age'])).toEqual({})
})
