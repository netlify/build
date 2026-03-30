import { describe, expect, test } from 'vitest'

import {
  MIGRATION_DIR_PATTERN,
  MIGRATION_FILE_PATTERN,
  trackMigrationNumber,
  validateMigrations,
  formatValidationErrors,
} from './validation.js'

describe('MIGRATION_DIR_PATTERN', () => {
  const validNames = [
    '1700000000_create-users',
    '1700000001_add-posts',
    '0000000000_init',
    '9999999999_z',
    '1700000000_a',
    '1700000000_abc-def-123',
    '001_create-users',
    '1_init',
    '0001_add-posts',
    '42_z',
    '1700000000_under_score',
    '001_create_users_table',
    '1_a_b_c',
  ]

  test.each(validNames)('matches valid name: %s', (name) => {
    expect(MIGRATION_DIR_PATTERN.test(name)).toBe(true)
  })

  const invalidNames = [
    { name: '1700000000_CAPS', reason: 'uppercase letters' },
    { name: 'no-timestamp', reason: 'no numeric prefix' },
    { name: '1700000000_', reason: 'empty slug' },
    { name: '1700000000', reason: 'missing underscore and slug' },
    { name: '_create-users', reason: 'missing number prefix' },
    { name: '1700000000_hello world', reason: 'spaces in slug' },
    { name: '1700000000_special!char', reason: 'special characters in slug' },
  ]

  test.each(invalidNames)('rejects invalid name: $name ($reason)', ({ name }) => {
    expect(MIGRATION_DIR_PATTERN.test(name)).toBe(false)
  })
})

describe('MIGRATION_FILE_PATTERN', () => {
  const validNames = [
    '1700000000_create-users.sql',
    '001_create_users_table.sql',
    '1_init.sql',
    '42_a-b-c.sql',
    '1700000000_under_score.sql',
  ]

  test.each(validNames)('matches valid name: %s', (name) => {
    expect(MIGRATION_FILE_PATTERN.test(name)).toBe(true)
  })

  const invalidNames = [
    { name: '1700000000_CAPS.sql', reason: 'uppercase letters' },
    { name: 'no-timestamp.sql', reason: 'no numeric prefix' },
    { name: '1700000000_.sql', reason: 'empty slug' },
    { name: '1700000000_create-users.txt', reason: 'wrong extension' },
    { name: '1700000000_create-users', reason: 'no extension' },
    { name: '1700000000_hello world.sql', reason: 'spaces in slug' },
  ]

  test.each(invalidNames)('rejects invalid name: $name ($reason)', ({ name }) => {
    expect(MIGRATION_FILE_PATTERN.test(name)).toBe(false)
  })
})

describe('trackMigrationNumber', () => {
  const cases = [
    { name: '001_create-users', expected: 1 },
    { name: '1_init', expected: 1 },
    { name: '0001_add-posts', expected: 1 },
    { name: '42_z', expected: 42 },
    { name: '1700000000_create-users', expected: 1700000000 },
    { name: '1700000000_create-users.sql', expected: 1700000000 },
    { name: '001_create-users.sql', expected: 1 },
  ]

  test.each(cases)('tracks $name under number $expected', ({ name, expected }) => {
    const map = new Map<number, string[]>()
    trackMigrationNumber(map, name)
    expect(map.get(expected)).toEqual([name])
  })

  test('groups names with the same migration number', () => {
    const map = new Map<number, string[]>()
    trackMigrationNumber(map, '001_create-users')
    trackMigrationNumber(map, '1_init')
    expect(map.get(1)).toEqual(['001_create-users', '1_init'])
  })
})

describe('validateMigrations', () => {
  test('returns valid result with sorted dirs when all dirs are valid', () => {
    const dirNames = ['1700000001_add-posts', '1700000000_create-users']
    const existingSqlFiles = new Set(['1700000000_create-users', '1700000001_add-posts'])

    const result = validateMigrations(dirNames, [], existingSqlFiles)

    expect(result).toEqual({
      valid: true,
      dirs: ['1700000000_create-users', '1700000001_add-posts'],
      files: [],
    })
  })

  test('silently skips non-matching directory names', () => {
    const dirNames = ['bad-name', '1700000000_create-users']
    const existingSqlFiles = new Set(['1700000000_create-users'])

    const result = validateMigrations(dirNames, [], existingSqlFiles)

    expect(result).toEqual({
      valid: true,
      dirs: ['1700000000_create-users'],
      files: [],
    })
  })

  test('returns error for missing migration.sql files', () => {
    const dirNames = ['1700000000_create-users', '1700000001_add-posts']
    const existingSqlFiles = new Set(['1700000000_create-users'])

    const result = validateMigrations(dirNames, [], existingSqlFiles)

    expect(result).toEqual({
      valid: false,
      errors: [{ type: 'missing_sql_file', dirName: '1700000001_add-posts' }],
    })
  })

  test('returns valid result with sorted files for loose .sql files', () => {
    const fileNames = ['002_add-posts.sql', '001_create-users.sql']

    const result = validateMigrations([], fileNames, new Set())

    expect(result).toEqual({
      valid: true,
      dirs: [],
      files: ['001_create-users.sql', '002_add-posts.sql'],
    })
  })

  test('silently skips non-matching file names', () => {
    const fileNames = ['README.sql', '001_create-users.sql', 'bad-name.sql']

    const result = validateMigrations([], fileNames, new Set())

    expect(result).toEqual({
      valid: true,
      dirs: [],
      files: ['001_create-users.sql'],
    })
  })

  test('handles mixed dirs and files', () => {
    const dirNames = ['1700000000_create-users']
    const fileNames = ['1700000001_add-posts.sql']
    const existingSqlFiles = new Set(['1700000000_create-users'])

    const result = validateMigrations(dirNames, fileNames, existingSqlFiles)

    expect(result).toEqual({
      valid: true,
      dirs: ['1700000000_create-users'],
      files: ['1700000001_add-posts.sql'],
    })
  })

  test('returns valid result for empty input', () => {
    const result = validateMigrations([], [], new Set())

    expect(result).toEqual({
      valid: true,
      dirs: [],
      files: [],
    })
  })

  test('allows underscores in dir names', () => {
    const dirNames = ['001_create_users_table']
    const existingSqlFiles = new Set(['001_create_users_table'])

    const result = validateMigrations(dirNames, [], existingSqlFiles)

    expect(result).toEqual({
      valid: true,
      dirs: ['001_create_users_table'],
      files: [],
    })
  })

  test('returns error for duplicate migration numbers in dirs', () => {
    const dirNames = ['001_create-users', '001_add-posts']
    const existingSqlFiles = new Set(['001_create-users', '001_add-posts'])

    const result = validateMigrations(dirNames, [], existingSqlFiles)

    expect(result).toEqual({
      valid: false,
      errors: [
        { type: 'duplicate_migration_number', migrationNumber: 1, names: ['001_add-posts', '001_create-users'] },
      ],
    })
  })

  test('returns error for duplicate migration numbers in files', () => {
    const fileNames = ['001_create-users.sql', '001_add-posts.sql']

    const result = validateMigrations([], fileNames, new Set())

    expect(result).toEqual({
      valid: false,
      errors: [
        {
          type: 'duplicate_migration_number',
          migrationNumber: 1,
          names: ['001_add-posts.sql', '001_create-users.sql'],
        },
      ],
    })
  })

  test('returns error for duplicate migration numbers across dirs and files', () => {
    const dirNames = ['001_create-users']
    const fileNames = ['001_add-posts.sql']
    const existingSqlFiles = new Set(['001_create-users'])

    const result = validateMigrations(dirNames, fileNames, existingSqlFiles)

    expect(result).toEqual({
      valid: false,
      errors: [
        { type: 'duplicate_migration_number', migrationNumber: 1, names: ['001_add-posts.sql', '001_create-users'] },
      ],
    })
  })

  test('treats different zero-padded prefixes as duplicates', () => {
    const dirNames = ['1_init', '001_setup']
    const existingSqlFiles = new Set(['1_init', '001_setup'])

    const result = validateMigrations(dirNames, [], existingSqlFiles)

    expect(result).toEqual({
      valid: false,
      errors: [{ type: 'duplicate_migration_number', migrationNumber: 1, names: ['001_setup', '1_init'] }],
    })
  })
})

describe('formatValidationErrors', () => {
  test('formats missing_sql_file errors', () => {
    const message = formatValidationErrors([{ type: 'missing_sql_file', dirName: '1700000000_create-users' }])

    expect(message).toContain('Database migration validation failed')
    expect(message).toContain('"1700000000_create-users/migration.sql" is missing')
  })

  test('formats multiple errors', () => {
    const message = formatValidationErrors([
      { type: 'missing_sql_file', dirName: '1700000000_create-users' },
      { type: 'missing_sql_file', dirName: '1700000001_add-posts' },
    ])

    expect(message).toContain('"1700000000_create-users/migration.sql" is missing')
    expect(message).toContain('"1700000001_add-posts/migration.sql" is missing')
  })

  test('formats duplicate_migration_number errors', () => {
    const message = formatValidationErrors([
      { type: 'duplicate_migration_number', migrationNumber: 1, names: ['001_add-posts', '001_create-users'] },
    ])

    expect(message).toContain('Database migration validation failed')
    expect(message).toContain('Duplicate migration number 1: "001_add-posts", "001_create-users"')
  })
})
