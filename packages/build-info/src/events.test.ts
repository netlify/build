import { test, expect } from 'vitest'

import { EventEmitter } from './events.js'

test('should throw if a callback is not a function', () => {
  const events = new EventEmitter()
  expect(() => events.on('test', 'test' as any)).toThrowError('Callback parameter has to be a function.')
})

test('should work with async callbacks', async () => {
  const events = new EventEmitter()
  let value = 0

  events.on('test', async (val: number) => {
    await new Promise<void>((res) =>
      setTimeout(() => {
        value = val
        res()
      }, 10),
    )
  })

  expect(value).toBe(0)
  const promise = events.emit('test', 10)
  expect(value).toBe(0)
  await promise
  expect(value).toBe(10)
  await events.emit('test', 20)
  expect(value).toBe(20)
})
