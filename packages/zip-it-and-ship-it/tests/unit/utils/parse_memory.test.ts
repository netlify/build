import { describe, expect, test } from 'vitest'

import { parseMemoryMB } from '../../../src/utils/parse_memory.js'

describe('parseMemoryMB', () => {
  test('returns numbers unchanged', () => {
    expect(parseMemoryMB(1024)).toBe(1024)
  })

  describe('string inputs', () => {
    test('parses a bare numeric string as MB', () => {
      expect(parseMemoryMB('1024')).toBe(1024)
      expect(parseMemoryMB('1024.5')).toBe(1024.5)
    })

    test('parses an `mb` suffix', () => {
      expect(parseMemoryMB('1024mb')).toBe(1024)
    })

    test('converts a `gb` suffix to MB', () => {
      expect(parseMemoryMB('2gb')).toBe(2048)
      expect(parseMemoryMB('0.5gb')).toBe(512)
    })

    test('is case-insensitive for the unit', () => {
      expect(parseMemoryMB('1024MB')).toBe(1024)
      expect(parseMemoryMB('2Gb')).toBe(2048)
    })

    test('accepts whitespace around the value and between value and unit', () => {
      expect(parseMemoryMB('  1024  ')).toBe(1024)
      expect(parseMemoryMB('2 gb')).toBe(2048)
    })
  })

  describe('invalid string inputs return NaN', () => {
    test('non-numeric string', () => {
      expect(parseMemoryMB('lots')).toBeNaN()
    })

    test('empty or whitespace-only string', () => {
      expect(parseMemoryMB('')).toBeNaN()
      expect(parseMemoryMB('   ')).toBeNaN()
    })

    test('unit without a number', () => {
      expect(parseMemoryMB('gb')).toBeNaN()
    })

    test('unsupported unit', () => {
      expect(parseMemoryMB('1kb')).toBeNaN()
    })

    test('unit before number', () => {
      expect(parseMemoryMB('gb2')).toBeNaN()
    })

    test('negative number string', () => {
      expect(parseMemoryMB('-1gb')).toBeNaN()
    })

    test('non-finite numeric strings', () => {
      expect(parseMemoryMB('NaN')).toBeNaN()
      expect(parseMemoryMB('Infinity')).toBeNaN()
    })

    test('trailing garbage after a valid value', () => {
      expect(parseMemoryMB('2gb extra')).toBeNaN()
    })

    test('multiple values', () => {
      expect(parseMemoryMB('1 gb 2 mb')).toBeNaN()
    })

    test('exponent notation is not supported', () => {
      expect(parseMemoryMB('1e3mb')).toBeNaN()
    })

    test('hexadecimal is not supported', () => {
      expect(parseMemoryMB('0x400mb')).toBeNaN()
    })
  })
})
