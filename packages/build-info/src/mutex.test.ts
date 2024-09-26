import { describe, beforeEach, test, expect } from 'vitest'

import { Mutex } from './mutex.js'

describe('Mutex', () => {
  let mutex: Mutex

  beforeEach(() => {
    mutex = new Mutex()
  })

  test('should acquire and release the lock for a single operation', async () => {
    let isLocked = false

    await mutex.runExclusive(async () => {
      isLocked = mutex['_isLocked']
      expect(isLocked).toBe(true)
    })

    isLocked = mutex['_isLocked']
    expect(isLocked).toBe(false)
  })

  test('should run operations sequentially', async () => {
    const results: number[] = []

    const task = (id: number) => {
      return mutex.runExclusive(async () => {
        results.push(id)
        // Simulate async operation
        await new Promise((resolve) => setTimeout(resolve, 10))
      })
    }

    await Promise.all([task(1), task(2), task(3)])

    expect(results).toEqual([1, 2, 3])
  })

  test('should prevent concurrent access to critical section', async () => {
    let concurrentAccesses = 0
    let maxConcurrentAccesses = 0

    const task = () => {
      return mutex.runExclusive(async () => {
        concurrentAccesses++
        if (concurrentAccesses > maxConcurrentAccesses) {
          maxConcurrentAccesses = concurrentAccesses
        }
        // Simulate async operation
        await new Promise((resolve) => setTimeout(resolve, 10))
        concurrentAccesses--
      })
    }

    await Promise.all([task(), task(), task()])

    expect(maxConcurrentAccesses).toBe(1)
  })

  test('should release the lock even if an exception occurs', async () => {
    let isLockedDuringError = false

    const failingTask = () => {
      return mutex.runExclusive(async () => {
        isLockedDuringError = mutex['_isLocked']
        throw new Error('Intentional Error')
      })
    }

    await expect(failingTask()).rejects.toThrow('Intentional Error')

    const isLockedAfterError = mutex['_isLocked']
    expect(isLockedDuringError).toBe(true)
    expect(isLockedAfterError).toBe(false)
  })

  test('should handle mixed successful and failing operations', async () => {
    const results: string[] = []

    const successfulTask = () => {
      return mutex.runExclusive(async () => {
        results.push('success')
        await new Promise((resolve) => setTimeout(resolve, 10))
      })
    }

    const failingTask = () => {
      return mutex.runExclusive(async () => {
        results.push('fail')
        await new Promise((resolve) => setTimeout(resolve, 10))
        throw new Error('Intentional Error')
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const tasks = [successfulTask(), failingTask().catch(() => {}), successfulTask()]

    await Promise.all(tasks)

    expect(results).toEqual(['success', 'fail', 'success'])
    expect(mutex['_isLocked']).toBe(false)
  })
})
