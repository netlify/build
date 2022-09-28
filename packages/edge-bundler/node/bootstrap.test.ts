import { Buffer } from 'buffer'
import { env } from 'process'

import fetch, { Headers } from 'node-fetch'
import { test, expect } from 'vitest'

import { getBootstrapURL } from './formats/javascript.js'

test('Imports the bootstrap layer from a valid URL', async () => {
  const importURL = new URL(getBootstrapURL())
  const headers = new Headers()

  // `node-fetch` doesn't let us send credentials as part of the URL, so we
  // have to transform them into an `Authorization` header.
  if (importURL.username) {
    const auth = Buffer.from(`${importURL.username}:${importURL.password}`)

    importURL.username = ''
    importURL.password = ''

    headers.set('Authorization', `Basic ${auth.toString('base64')}`)
  }

  const canonicalURL = importURL.toString()
  const { status } = await fetch(canonicalURL, { headers })

  expect(status).toBe(200)
})

test('Imports the bootstrap layer from the URL present in the `NETLIFY_EDGE_BOOTSTRAP` environment variable, if present', () => {
  const mockURL = 'https://example.com/boot.ts'

  env.NETLIFY_EDGE_BOOTSTRAP = mockURL

  expect(getBootstrapURL()).toBe(mockURL)

  env.NETLIFY_EDGE_BOOTSTRAP = undefined
})
