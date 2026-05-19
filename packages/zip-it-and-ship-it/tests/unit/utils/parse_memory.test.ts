import { describe, expect, test } from 'vitest'

import { parseMemoryMB } from '../../../src/utils/parse_memory.js'

describe('parseMemoryMB', () => {
  describe('number inputs', () => {
    test('returns the number unchanged', () => {
      expect(parseMemoryMB(1024)).toBe(1024)
      expect(parseMemoryMB(2048)).toBe(2048)
      expect(parseMemoryMB(4096)).toBe(4096)
    })

    test('passes through 0 (range checks are the caller’s concern)', () => {
      expect(parseMemoryMB(0)).toBe(0)
    })

    test('rejects negative numbers (consistent with the string branch)', () => {
      expect(parseMemoryMB(-128)).toBeNaN()
      expect(parseMemoryMB(-1)).toBeNaN()
    })

    test('rejects Infinity and -Infinity', () => {
      expect(parseMemoryMB(Number.POSITIVE_INFINITY)).toBeNaN()
      expect(parseMemoryMB(Number.NEGATIVE_INFINITY)).toBeNaN()
    })

    test('rejects NaN', () => {
      expect(parseMemoryMB(Number.NaN)).toBeNaN()
    })

    test('rounds decimal numbers (consistent with string-input rounding)', () => {
      expect(parseMemoryMB(1024.4)).toBe(1024)
      expect(parseMemoryMB(1024.5)).toBe(1025)
      expect(parseMemoryMB(2047.6)).toBe(2048)
    })
  })

  describe('numeric string inputs (no unit)', () => {
    test('parses a bare integer string as MB', () => {
      expect(parseMemoryMB('1024')).toBe(1024)
      expect(parseMemoryMB('2048')).toBe(2048)
    })

    test('strips surrounding whitespace before parsing', () => {
      expect(parseMemoryMB('  1024  ')).toBe(1024)
      expect(parseMemoryMB('\t2048\n')).toBe(2048)
    })

    test('parses a decimal number string as MB and rounds to integer', () => {
      expect(parseMemoryMB('1024.4')).toBe(1024)
      expect(parseMemoryMB('1024.5')).toBe(1025)
      expect(parseMemoryMB('2048.7')).toBe(2049)
    })
  })

  describe('strings with an `mb` unit', () => {
    test('parses an integer with `mb` suffix', () => {
      expect(parseMemoryMB('1024mb')).toBe(1024)
      expect(parseMemoryMB('2048mb')).toBe(2048)
    })

    test('accepts a space between value and unit', () => {
      expect(parseMemoryMB('1024 mb')).toBe(1024)
      expect(parseMemoryMB('2048  mb')).toBe(2048)
    })

    test('is case-insensitive for the unit', () => {
      expect(parseMemoryMB('1024MB')).toBe(1024)
      expect(parseMemoryMB('1024Mb')).toBe(1024)
      expect(parseMemoryMB('1024mB')).toBe(1024)
    })

    test('rounds fractional `mb` values', () => {
      expect(parseMemoryMB('100.5mb')).toBe(101)
      expect(parseMemoryMB('100.4mb')).toBe(100)
    })

    test('handles surrounding whitespace', () => {
      expect(parseMemoryMB('  1024mb  ')).toBe(1024)
    })
  })

  describe('strings with a `gb` unit', () => {
    test('converts `gb` to MB (1 GB = 1024 MB)', () => {
      expect(parseMemoryMB('1gb')).toBe(1024)
      expect(parseMemoryMB('2gb')).toBe(2048)
      expect(parseMemoryMB('4gb')).toBe(4096)
    })

    test('accepts a space between value and unit', () => {
      expect(parseMemoryMB('2 gb')).toBe(2048)
      expect(parseMemoryMB('2  gb')).toBe(2048)
    })

    test('is case-insensitive for the unit', () => {
      expect(parseMemoryMB('2GB')).toBe(2048)
      expect(parseMemoryMB('2Gb')).toBe(2048)
      expect(parseMemoryMB('2gB')).toBe(2048)
    })

    test('handles fractional `gb` values and rounds to MB', () => {
      expect(parseMemoryMB('0.5gb')).toBe(512)
      expect(parseMemoryMB('1.5gb')).toBe(1536)
    })

    test('handles surrounding whitespace', () => {
      expect(parseMemoryMB('  2gb  ')).toBe(2048)
    })
  })

  describe('invalid inputs return NaN', () => {
    test('non-numeric string', () => {
      expect(parseMemoryMB('lots')).toBeNaN()
      expect(parseMemoryMB('a lot of memory')).toBeNaN()
    })

    test('empty or whitespace-only string', () => {
      expect(parseMemoryMB('')).toBeNaN()
      expect(parseMemoryMB('   ')).toBeNaN()
    })

    test('unit without a number', () => {
      expect(parseMemoryMB('gb')).toBeNaN()
      expect(parseMemoryMB('mb')).toBeNaN()
    })

    test('unsupported units', () => {
      expect(parseMemoryMB('1kb')).toBeNaN()
      expect(parseMemoryMB('1tb')).toBeNaN()
      expect(parseMemoryMB('1pb')).toBeNaN()
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
      expect(parseMemoryMB('1024 mb!')).toBeNaN()
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
