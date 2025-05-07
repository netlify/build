import { Client } from '@bugsnag/js'
import { describe, expect, test, vi } from 'vitest'

import { report } from './metrics.js'

describe('metrics', () => {
  describe('normalizeError', () => {
    const mockClient = { notify: (error) => console.error(error) } as Client

    test('returns an error when passed a string', async () => {
      const errorSpy = vi.spyOn(console, 'error')
      report('error happened', { client: mockClient })
      expect(errorSpy).toHaveBeenCalledOnce()
      expect(errorSpy.mock.calls[0][0]).toBeInstanceOf(Error)
      expect(errorSpy.mock.calls[0][0].message).toBe('error happened')
    })

    test('returns an error when passed an error', async () => {
      const errorSpy = vi.spyOn(console, 'error')
      report(new Error('error happened'), { client: mockClient })
      expect(errorSpy).toHaveBeenCalledOnce()
      expect(errorSpy.mock.calls[0][0]).toBeInstanceOf(Error)
      expect(errorSpy.mock.calls[0][0].message).toBe('error happened')
    })

    test('returns an object when passed an object in an expected format (1)', async () => {
      const errorSpy = vi.spyOn(console, 'error')
      report({ name: 'Error', message: 'error happened' }, { client: mockClient })
      expect(errorSpy).toHaveBeenCalledOnce()
      expect(errorSpy.mock.calls[0][0]).not.toBeInstanceOf(Error)
      expect(errorSpy.mock.calls[0][0].name).toBe('Error')
      expect(errorSpy.mock.calls[0][0].message).toBe('error happened')
    })

    test('returns an object when passed an object in an expected format (2)', async () => {
      const errorSpy = vi.spyOn(console, 'error')
      report({ errorClass: 'Error', errorMessage: 'error happened' }, { client: mockClient })
      expect(errorSpy).toHaveBeenCalledOnce()
      expect(errorSpy.mock.calls[0][0]).not.toBeInstanceOf(Error)
      expect(errorSpy.mock.calls[0][0].errorClass).toBe('Error')
      expect(errorSpy.mock.calls[0][0].errorMessage).toBe('error happened')
    })

    test('returns an error when passed an object in an unexpected format but includes a message', async () => {
      const errorSpy = vi.spyOn(console, 'error')
      report({ message: 'error happened', documentation_url: 'bar' }, { client: mockClient })
      expect(errorSpy).toHaveBeenCalledOnce()
      expect(errorSpy.mock.calls[0][0]).toBeInstanceOf(Error)
      expect(errorSpy.mock.calls[0][0].message).toBe('error happened')
    })

    test('returns an error when passed an object in an unexpected format', async () => {
      const errorSpy = vi.spyOn(console, 'error')
      report({ foo: 'bar' }, { client: mockClient })
      expect(errorSpy).toHaveBeenCalledOnce()
      expect(errorSpy.mock.calls[0][0]).toBeInstanceOf(Error)
      expect(errorSpy.mock.calls[0][0].message).toBe('Unexpected error format: {"foo":"bar"}')
    })
  })
})
