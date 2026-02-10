import { describe, expect, test } from 'vitest'

import { MIGRATION_DIR_PATTERN, validateMigrationDirs, formatValidationErrors } from './validation.js'

describe('MIGRATION_DIR_PATTERN', () => {
  const validNames = [
    '1700000000_create-users',
    '1700000001_add-posts',
    '0000000000_init',
    '9999999999_z',
    '1700000000_a',
    '1700000000_abc-def-123',
  ]

  test.each(validNames)('matches valid name: %s', (name) => {
    expect(MIGRATION_DIR_PATTERN.test(name)).toBe(true)
  })

  const invalidNames = [
    { name: '170000000_short-ts', reason: '9-digit timestamp' },
    { name: '17000000000_long-ts', reason: '11-digit timestamp' },
    { name: '1700000000_CAPS', reason: 'uppercase letters' },
    { name: '1700000000_under_score', reason: 'underscores in slug' },
    { name: 'no-timestamp', reason: 'no timestamp prefix' },
    { name: '1700000000_', reason: 'empty slug' },
    { name: '1700000000', reason: 'missing underscore and slug' },
    { name: '_create-users', reason: 'missing timestamp' },
    { name: '1700000000_hello world', reason: 'spaces in slug' },
    { name: '1700000000_special!char', reason: 'special characters in slug' },
  ]

  test.each(invalidNames)('rejects invalid name: $name ($reason)', ({ name }) => {
    expect(MIGRATION_DIR_PATTERN.test(name)).toBe(false)
  })
})

describe('validateMigrationDirs', () => {
  test('returns valid result with sorted dirs when all dirs are valid', () => {
    const dirNames = ['1700000001_add-posts', '1700000000_create-users']
    const existingSqlFiles = new Set(['1700000000_create-users', '1700000001_add-posts'])

    const result = validateMigrationDirs(dirNames, existingSqlFiles)

    expect(result.valid).toBe(true)
    if (result.valid) {
      expect(result.dirs).toEqual(['1700000000_create-users', '1700000001_add-posts'])
    }
  })

  test('returns error for invalid directory names', () => {
    const dirNames = ['bad-name', '1700000000_create-users']
    const existingSqlFiles = new Set(['1700000000_create-users'])

    const result = validateMigrationDirs(dirNames, existingSqlFiles)

    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors).toEqual([{ type: 'invalid_dir_name', dirName: 'bad-name' }])
    }
  })

  test('returns error for missing migration.sql files', () => {
    const dirNames = ['1700000000_create-users', '1700000001_add-posts']
    const existingSqlFiles = new Set(['1700000000_create-users'])

    const result = validateMigrationDirs(dirNames, existingSqlFiles)

    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors).toEqual([{ type: 'missing_sql_file', dirName: '1700000001_add-posts' }])
    }
  })

  test('reports both invalid names and missing files', () => {
    const dirNames = ['bad-name', '1700000001_add-posts']
    const existingSqlFiles = new Set<string>()

    const result = validateMigrationDirs(dirNames, existingSqlFiles)

    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors).toHaveLength(2)
      expect(result.errors[0]).toEqual({ type: 'invalid_dir_name', dirName: 'bad-name' })
      expect(result.errors[1]).toEqual({ type: 'missing_sql_file', dirName: '1700000001_add-posts' })
    }
  })

  test('returns valid result for empty input', () => {
    const result = validateMigrationDirs([], new Set())

    expect(result.valid).toBe(true)
    if (result.valid) {
      expect(result.dirs).toEqual([])
    }
  })
})

describe('formatValidationErrors', () => {
  test('formats invalid_dir_name errors', () => {
    const message = formatValidationErrors([{ type: 'invalid_dir_name', dirName: 'bad-name' }])

    expect(message).toContain('Database migration validation failed')
    expect(message).toContain('"bad-name"')
    expect(message).toContain('<10-digit-timestamp>_<slug>')
  })

  test('formats missing_sql_file errors', () => {
    const message = formatValidationErrors([{ type: 'missing_sql_file', dirName: '1700000000_create-users' }])

    expect(message).toContain('Database migration validation failed')
    expect(message).toContain('"1700000000_create-users/migration.sql" is missing')
  })

  test('formats multiple errors', () => {
    const message = formatValidationErrors([
      { type: 'invalid_dir_name', dirName: 'bad-name' },
      { type: 'missing_sql_file', dirName: '1700000001_add-posts' },
    ])

    expect(message).toContain('"bad-name"')
    expect(message).toContain('"1700000001_add-posts/migration.sql" is missing')
  })
})
