import { expect, test } from 'vitest'

import { findLikelySecrets } from '../../lib/plugins_core/secrets_scanning/utils.js'

test('findLikelySecrets - should not find secrets without quotes or delimiters', () => {
  const lines = [
    'aws_Kj2P9xL5mN8vB3cX7qA4',
    'ghp_zR4wY7hQ9sK2nM5vL8xbkokM0vgXC',
    'xoxb-bV8cX3zL6kM9nQ4wR7y3FIASwY6YX',
    'nf_pT2hN7mK4jL9wB5vC8xOzHucej7Or',
  ]

  lines.forEach((text) => {
    const matches = findLikelySecrets({ text })
    expect(matches).toHaveLength(0)
  })
})

test('findLikelySecrets - should find secrets with quotes or equals', () => {
  const matchingLines = [
    'my_secret_key=aws_Kj2P9xL5mN8vB3cX7qA4',
    'mySecretKey = aws_zR4wY7hQ9sK2nM5vL8xbkokM0vgXC',
    'secretKey="aws_dF6gH9jK4mP7nW2xR5tYc6dBmFP5ym"',
    'secretKey = "aws_bV8cX3zL6kM9nQ4wR7y3FIASwY6YX"',
    "secretKey='aws_pT2hN7mK4jL9wB5vC8xOzHucej7Or'",
    'secretKey=`aws_qS3fD8gH5jK2mN6pR9yHfBxkujdx2`',
  ]
  matchingLines.forEach((text) => {
    const matches = findLikelySecrets({ text })
    expect(matches).toHaveLength(1)
  })
})

test('findLikelySecrets - should not match values with spaces after prefix', () => {
  const nonMatchingLine = 'aws_ "Kj2P9xL5mN8vB3cX7qA4"'
  const matches = findLikelySecrets({ text: nonMatchingLine })
  expect(matches).toHaveLength(0)
})

test('findLikelySecrets - should not match values that are too short', () => {
  const matches = findLikelySecrets({ text: 'aws_key="aws_x7B9nM4k"' })
  expect(matches).toHaveLength(0)
})

test('findLikelySecrets - should return the matched prefix as the key', () => {
  const matches = findLikelySecrets({ text: 'mykey = "github_pat_Kj2P9xL5mN8vB3cX7qA4"' })
  expect(matches).toHaveLength(1)
  expect(matches[0].prefix).toBe('github_pat_')
})

test('findLikelySecrets - should handle empty or invalid input', () => {
  const invalidInputs = ['', ' ', null, undefined]

  for (const input of invalidInputs) {
    const matches = findLikelySecrets({ text: input })
    expect(matches).toHaveLength(0)
  }
})

test('findLikelySecrets - should match different prefixes from LIKELY_SECRET_PREFIXES', () => {
  const lines = [
    'key="ghp_zR4wY7hQ9sK2nM5vL8xbkokM0vgX"',
    'key="sk_zR4wY7hQ9sK2nM5vL8xbkokM0vgX"',
    'key="aws_zR4wY7hQ9sK2nM5vL8xbkokM0vgX"',
  ]

  lines.forEach((text) => {
    const matches = findLikelySecrets({ text })
    expect(matches).toHaveLength(1)
  })
})

test('findLikelySecrets - should skip safe-listed values', () => {
  const text = 'const someString = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED"'
  const matches = findLikelySecrets({ text })
  expect(matches).toHaveLength(0)
})

test('findLikelySecrets - should allow dashes and alphanumeric characters only', () => {
  const validLines = ['key="aws_zR4wY7hQ-9sK2nM5vL8xbko-kM0vgXKj2P"', 'key="ghp_zR4wY7hQ9sK2n-M5vL8xbkokM0vgX"']

  validLines.forEach((line) => {
    const matches = findLikelySecrets({ text: line })
    expect(matches, `Should match line with dashes: ${line}`).toHaveLength(1)
  })

  const invalidLines = [
    'key="aws_zR4wY7hQ9sK2nMgX!@#$%^&*()_+"',
    'key="ghp_zR4wY7hQ.9sK2nM5vL8.xbkokM0vgX"',
    'key="sk_R4_wY7hQ9sK2_nM5vL8xbkokM0vgX"',
  ]

  invalidLines.forEach((line) => {
    const matches = findLikelySecrets({ text: line })
    expect(matches, `Should not match line with special characters: ${line}`).toHaveLength(0)
  })
})

test('findLikelySecrets - should match full secret value against omitValues', () => {
  // Test both partial and full matches to ensure proper behavior
  const partialMatch = findLikelySecrets({
    text: 'key="aws_zR4wY7hQ9sK2nM5vL8xbkokM0vgX"',
    // The omitValue only partially matches the secret - we should still detect the secret
    omitValuesFromEnhancedScan: ['aws_zR4wY7hQ9'],
  })
  expect(partialMatch).toHaveLength(1)

  const fullMatch = findLikelySecrets({
    text: 'key="aws_zR4wY7hQ9sK2nM5vL8xbkokM0vgX"',
    // Omit the full secret value - we should not detect the secret
    omitValuesFromEnhancedScan: ['aws_zR4wY7hQ9sK2nM5vL8xbkokM0vgX'],
  })
  expect(fullMatch).toHaveLength(0)
})

test('findLikelySecrets - should match omitValues case-insensitively', () => {
  const testCases = [
    {
      text: 'key="AIzaSyBdVl-cTICSwYKrZ96snp88z"',
      omitValue: 'AIzaSyBdVl-cTICSwYKrZ96snp88z',
      description: 'exact case match',
    },
    {
      text: 'key="AIzaSyBdVl-cTICSwYKrZ96snp88z"',
      omitValue: 'aizaSyBdVl-cTICSwYKrZ96snp88z',
      description: 'lowercase prefix in omit value',
    },
    {
      text: 'key="aizaSyBdVl-cTICSwYKrZ96snp88z"',
      omitValue: 'AIzaSyBdVl-cTICSwYKrZ96snp88z',
      description: 'lowercase prefix in detected secret',
    },
    {
      text: 'key="AIZASYBD-VLTICTCSWYKRZ96SNP88Z"',
      omitValue: 'aizasybd-vltictcswykrz96snp88z',
      description: 'all uppercase secret with lowercase omit value',
    },
  ]

  testCases.forEach(({ text, omitValue, description }) => {
    const matches = findLikelySecrets({
      text,
      omitValuesFromEnhancedScan: [omitValue],
    })
    expect(matches, `Should omit secret for case: ${description}`).toHaveLength(0)
  })
})
