import test from 'ava'

import { findLikelySecrets } from '../../lib/plugins_core/secrets_scanning/utils.js'

const testFile = 'test.txt'

test('findLikelySecrets - should find secrets with common prefixes at the beginning of a line', async (t) => {
  const lines = [
    'aws_123456789012345678',
    'ghp_1234567890123456789',
    'xoxb-123456789012345678',
    'nf_123456789012345678',
  ]

  lines.forEach((line, index) => {
    const matches = findLikelySecrets({ line, file: testFile, lineNumber: index })
    t.is(matches.length, 1)
    t.like(matches[0], {
      file: testFile,
      lineNumber: index,
      enhancedMatch: true,
    })
  })
})

test('findLikelySecrets - should find secrets with various delimiters at the beginning', async (t) => {
  const matchingLines = [
    'my_secret_key=aws_123456789012345678',
    'awsKey: aws_123456789012345678',
    'mySecretKey = aws_123456789012345678',
    'secretKey="aws_123456789012345678"',
    "secretKey='aws_123456789012345678'",
    'secretKey=`aws_123456789012345678`',
    'someKey, aws_123456789012345678, otherKey',
  ]
  matchingLines.forEach((line, index) => {
    const matches = findLikelySecrets({ line, file: testFile, lineNumber: index })
    t.is(matches.length, 1)

    t.like(matches[0], {
      file: testFile,
      lineNumber: index,
      enhancedMatch: true,
    })
  })
})

test('findLikelySecrets - should not match values with spaces after prefix', async (t) => {
  const nonMatchingLine = 'aws_ "123456789012345678"'
  const matches = findLikelySecrets({ line: nonMatchingLine, file: testFile, lineNumber: 0 })
  t.is(matches.length, 0)
})

test('findLikelySecrets - should not match values that are too short', async (t) => {
  const matches = findLikelySecrets({ line: 'aws_key=12345678901', file: testFile, lineNumber: 1 })
  t.is(matches.length, 0)
})

test('findLikelySecrets - should return the matched prefix as the key', async (t) => {
  const matches = findLikelySecrets({ line: 'github_pat_123456789012345678', file: testFile, lineNumber: 1 })
  t.is(matches.length, 1)
  t.is(matches[0].key, 'github_pat_')
})

test('findLikelySecrets - should handle empty or invalid input', async (t) => {
  const invalidInputs = ['', ' ', null, undefined]

  for (const input of invalidInputs) {
    const matches = findLikelySecrets({ line: input, file: testFile, lineNumber: 1 })
    t.is(matches.length, 0)
  }
})

test('findLikelySecrets - should match exactly minimum chars after prefix', async (t) => {
  const exactMinChars = 'aws_123456789012' // Exactly 12 chars after prefix
  const matches = findLikelySecrets({ line: exactMinChars, file: testFile, lineNumber: 1 })
  t.is(matches.length, 1)
})

test('findLikelySecrets - should match different prefixes from LIKELY_SECRET_PREFIXES', async (t) => {
  const lines = [
    'ghp_123456789012345678', // GitHub personal access token
    'sk_live_123456789012345678', // Stripe key
    'AKIAXXXXXXXXXXXXXXXX', // AWS access key
  ]

  lines.forEach((line, index) => {
    const matches = findLikelySecrets({ line, file: testFile, lineNumber: index })
    t.is(matches.length, 1)
  })
})

test('findLikelySecrets - should match secrets with special characters', async (t) => {
  const lines = [
    'aws_abc123!@#$%^&*()_+', // Special chars
    'ghp_abc-123_456.789', // Common separator chars
    'sk_live_123-456_789.000', // Mix of numbers and separators
  ]

  lines.forEach((line, index) => {
    const matches = findLikelySecrets({ line, file: testFile, lineNumber: index })
    t.is(matches.length, 1)
  })
})

test('findLikelySecrets - should not match secrets with that correspond to a SECRET_SCAN_OMIT_VALUES value', async (t) => {
  const matches = findLikelySecrets({
    line: 'match is explicitly omitted aws_123456789012345678',
    file: testFile,
    lineNumber: 1,
    omitValuesFromEnhancedScan: ['aws_123456789012345678'],
  })
  t.is(matches.length, 0)
})
