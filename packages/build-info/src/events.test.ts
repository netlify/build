import { test, expect } from 'vitest'

import { EventEmitter } from './events.js'

test('should throw if a callback is not a function', () => {
  const events = new EventEmitter()
  expect(() => events.on('test', 'test' as any)).toThrowError('Callback parameter has to be a function.')
})
