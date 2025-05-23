import test from 'ava'

import { findLikelySecrets } from '../../lib/plugins_core/secrets_scanning/utils.js'

const testFile = 'test.txt'

test('findLikelySecrets - should not find secrets without quotes or delimiters', async (t) => {
  const lines = [
    'aws_123456789012345678',
    'ghp_1234567890123456789',
    'xoxb-123456789012345678',
    'nf_123456789012345678',
  ]

  lines.forEach((line, index) => {
    const matches = findLikelySecrets({ line, file: testFile, lineNumber: index })
    t.is(matches.length, 0, `Should not match line: ${line}`)
  })
})

test('findLikelySecrets - should find secrets with quotes or delimiters', async (t) => {
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
  const matches = findLikelySecrets({ line: 'key="github_pat_123456789012345678"', file: testFile, lineNumber: 1 })
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
  const exactMinChars = 'key="aws_123456789012"' // Exactly 12 chars after prefix
  const matches = findLikelySecrets({ line: exactMinChars, file: testFile, lineNumber: 1 })
  t.is(matches.length, 1)
})

test('findLikelySecrets - should match different prefixes from LIKELY_SECRET_PREFIXES', async (t) => {
  const lines = [
    'key="ghp_123456789012345678"', // GitHub personal access token
    'key="sk_123456789012345678"', // Stripe key
    'key="aws_123456789012345678"', // AWS access key
  ]

  lines.forEach((line, index) => {
    const matches = findLikelySecrets({ line, file: testFile, lineNumber: index })
    t.is(matches.length, 1)
  })
})

test('findLikelySecrets - should skip safe-listed values', async (t) => {
  const line = 'const someString = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED"'
  const matches = findLikelySecrets({ line, file: testFile, lineNumber: 1 })
  t.is(matches.length, 0)
})

test('findLikelySecrets - should allow dashes and alphanumeric characters only', async (t) => {
  const validLines = ['key="aws_abc123-456-789"', 'key="ghp_abc-123-def-456"']

  validLines.forEach((line, index) => {
    const matches = findLikelySecrets({ line, file: testFile, lineNumber: index })
    t.is(matches.length, 1, `Should match line with dashes: ${line}`)
  })

  const invalidLines = ['key="aws_abc123!@#$%^&*()_+"', 'key="ghp_abc.123_456.789"', 'key="sk_live_123_456_789"']

  invalidLines.forEach((line, index) => {
    const matches = findLikelySecrets({ line, file: testFile, lineNumber: index })
    t.is(matches.length, 0, `Should not match line with special characters: ${line}`)
  })
})

test('findLikelySecrets - should match full secret value against omitValues', async (t) => {
  // Test both partial and full matches to ensure proper behavior
  const partialMatch = findLikelySecrets({
    line: 'key="aws_123456789012extracharshere"',
    file: testFile,
    lineNumber: 1,
    // The omitValue only partially matches the secret - we should still detect the secret
    omitValuesFromEnhancedScan: ['aws_123456789012'],
  })
  t.is(partialMatch.length, 1)

  const fullMatch = findLikelySecrets({
    line: 'key="aws_123456789012extracharshere"',
    file: testFile,
    lineNumber: 1,
    // Omit the full secret value - we should not detect the secret
    omitValuesFromEnhancedScan: ['aws_123456789012extracharshere'],
  })
  t.is(fullMatch.length, 0)
})
