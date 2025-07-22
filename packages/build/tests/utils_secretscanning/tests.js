import test from 'ava'

import { findLikelySecrets } from '../../lib/plugins_core/secrets_scanning/utils.js'

test('findLikelySecrets - should not find secrets without quotes or delimiters', async (t) => {
  const lines = [
    'aws_Kj2P9xL5mN8vB3cX7qA4',
    'ghp_zR4wY7hQ9sK2nM5vL8xbkokM0vgXC',
    'xoxb-bV8cX3zL6kM9nQ4wR7y3FIASwY6YX',
    'nf_pT2hN7mK4jL9wB5vC8xOzHucej7Or',
  ]

  lines.forEach((text) => {
    const matches = findLikelySecrets({ text })
    t.is(matches.length, 0)
  })
})

test('findLikelySecrets - should find secrets with quotes or equals', async (t) => {
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
    t.is(matches.length, 1)
  })
})

test('findLikelySecrets - should not match values with spaces after prefix', async (t) => {
  const nonMatchingLine = 'aws_ "Kj2P9xL5mN8vB3cX7qA4"'
  const matches = findLikelySecrets({ text: nonMatchingLine })
  t.is(matches.length, 0)
})

test('findLikelySecrets - should not match values that are too short', async (t) => {
  const matches = findLikelySecrets({ text: 'aws_key="aws_x7B9nM4k"' })
  t.is(matches.length, 0)
})

test('findLikelySecrets - should return the matched prefix as the key', async (t) => {
  const matches = findLikelySecrets({ text: 'mykey = "github_pat_Kj2P9xL5mN8vB3cX7qA4"' })
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

test('findLikelySecrets - should match different prefixes from LIKELY_SECRET_PREFIXES', async (t) => {
  const lines = [
    'key="ghp_zR4wY7hQ9sK2nM5vL8xbkokM0vgX"',
    'key="sk_zR4wY7hQ9sK2nM5vL8xbkokM0vgX"',
    'key="aws_zR4wY7hQ9sK2nM5vL8xbkokM0vgX"',
  ]

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
  const validLines = ['key="aws_zR4wY7hQ-9sK2nM5vL8xbko-kM0vgXKj2P"', 'key="ghp_zR4wY7hQ9sK2n-M5vL8xbkokM0vgX"']

  validLines.forEach((line) => {
    const matches = findLikelySecrets({ text: line })
    t.is(matches.length, 1, `Should match line with dashes: ${line}`)
  })

  const invalidLines = [
    'key="aws_zR4wY7hQ9sK2nMgX!@#$%^&*()_+"',
    'key="ghp_zR4wY7hQ.9sK2nM5vL8.xbkokM0vgX"',
    'key="sk_R4_wY7hQ9sK2_nM5vL8xbkokM0vgX"',
  ]

  invalidLines.forEach((line) => {
    const matches = findLikelySecrets({ text: line })
    t.is(matches.length, 0, `Should not match line with special characters: ${line}`)
  })
})

test('findLikelySecrets - should match full secret value against omitValues', async (t) => {
  // Test both partial and full matches to ensure proper behavior
  const partialMatch = findLikelySecrets({
    text: 'key="aws_zR4wY7hQ9sK2nM5vL8xbkokM0vgX"',
    // The omitValue only partially matches the secret - we should still detect the secret
    omitValuesFromEnhancedScan: ['aws_zR4wY7hQ9'],
  })
  t.is(partialMatch.length, 1)

  const fullMatch = findLikelySecrets({
    text: 'key="aws_zR4wY7hQ9sK2nM5vL8xbkokM0vgX"',
    // Omit the full secret value - we should not detect the secret
    omitValuesFromEnhancedScan: ['aws_zR4wY7hQ9sK2nM5vL8xbkokM0vgX'],
  })
  t.is(fullMatch.length, 0)
})
