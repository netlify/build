import test from 'ava'

import { findLikelySecrets } from '../../lib/plugins_core/secrets_scanning/utils.js'

test('findLikelySecrets - should not find secrets without quotes or delimiters', async (t) => {
  const lines = [
    'aws_123456789012345678',
    'ghp_1234567890123456789',
    'xoxb-123456789012345678',
    'nf_123456789012345678',
  ]

  lines.forEach((text) => {
    const matches = findLikelySecrets({ text })
    t.is(matches.length, 0)
  })
})

test('findLikelySecrets - should find secrets with quotes or equals', async (t) => {
  const matchingLines = [
    'my_secret_key=aws_123456789012345678',
    'mySecretKey = aws_123456789012345678',
    'secretKey="aws_123456789012345678"',
    'secretKey = "aws_123456789012345678"',
    "secretKey='aws_123456789012345678'",
    'secretKey=`aws_123456789012345678`',
  ]
  matchingLines.forEach((text) => {
    const matches = findLikelySecrets({ text })
    t.is(matches.length, 1)
  })
})

test('findLikelySecrets - should not match values with spaces after prefix', async (t) => {
  const nonMatchingLine = 'aws_ "123456789012345678"'
  const matches = findLikelySecrets({ text: nonMatchingLine })
  t.is(matches.length, 0)
})

test('findLikelySecrets - should not match values that are too short', async (t) => {
  const matches = findLikelySecrets({ text: 'aws_key="12345678901"' })
  t.is(matches.length, 0)
})

test('findLikelySecrets - should return the matched prefix as the key', async (t) => {
  const matches = findLikelySecrets({ text: 'mykey = "github_pat_123456789012345678"' })
  t.is(matches.length, 1)
  t.is(matches[0].prefix, 'github_pat_')
})

test('findLikelySecrets - should handle empty or invalid input', async (t) => {
  const invalidInputs = ['', ' ', null, undefined]

  for (const input of invalidInputs) {
    const matches = findLikelySecrets({ text: input })
    t.is(matches.length, 0)
  }
})

test('findLikelySecrets - should match exactly minimum chars after prefix', async (t) => {
  const exactMinChars = 'value = "aws_123456789012"' // Exactly 12 chars after prefix
  const matches = findLikelySecrets({ text: exactMinChars })
  t.is(matches.length, 1)
})

test('findLikelySecrets - should match different prefixes from LIKELY_SECRET_PREFIXES', async (t) => {
  const lines = ['key="ghp_123456789012345678"', 'key="sk_123456789012345678"', 'key="aws_123456789012345678"']

  lines.forEach((text) => {
    const matches = findLikelySecrets({ text })
    t.is(matches.length, 1)
  })
})

test('findLikelySecrets - should skip safe-listed values', async (t) => {
  const text = 'const someString = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED"'
  const matches = findLikelySecrets({ text })
  t.is(matches.length, 0)
})

test('findLikelySecrets - should allow dashes and alphanumeric characters only', async (t) => {
  const validLines = ['key="aws_abc123-456-789"', 'key="ghp_abc-123-def-456"']

  validLines.forEach((line) => {
    const matches = findLikelySecrets({ text: line })
    t.is(matches.length, 1, `Should match line with dashes: ${line}`)
  })

  const invalidLines = ['key="aws_abc123!@#$%^&*()_+"', 'key="ghp_abc.123_456.789"', 'key="sk_live_123_456_789"']

  invalidLines.forEach((line) => {
    const matches = findLikelySecrets({ text: line })
    t.is(matches.length, 0, `Should not match line with special characters: ${line}`)
  })
})

test('findLikelySecrets - should match full secret value against omitValues', async (t) => {
  // Test both partial and full matches to ensure proper behavior
  const partialMatch = findLikelySecrets({
    text: 'key="aws_123456789012extracharshere"',
    // The omitValue only partially matches the secret - we should still detect the secret
    omitValuesFromEnhancedScan: ['aws_123456789012'],
  })
  t.is(partialMatch.length, 1)

  const fullMatch = findLikelySecrets({
    text: 'key="aws_123456789012extracharshere"',
    // Omit the full secret value - we should not detect the secret
    omitValuesFromEnhancedScan: ['aws_123456789012extracharshere'],
  })
  t.is(fullMatch.length, 0)
})
