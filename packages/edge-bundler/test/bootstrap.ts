import { Buffer } from 'buffer'
import { env } from 'process'

import test from 'ava'
import fetch, { Headers } from 'node-fetch'

import { getBootstrapImport } from '../src/bootstrap.js'

const importURLRegex = /^import { boot } from "(.*)";$/m

test.serial('Imports the bootstrap layer from a valid URL', async (t) => {
  const importLine = getBootstrapImport()
  const match = importLine.match(importURLRegex)
  const url = match?.[1]

  if (url === undefined) {
    t.fail('Import expression is invalid')

    return
  }

  const importURL = new URL(url)
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

  t.is(status, 200)
})

test.serial(
  'Imports the bootstrap layer from the URL present in the `NETLIFY_EDGE_BOOTSTRAP` environment variable, if present',
  (t) => {
    const mockURL = 'https://example.com/boot.ts'

    env.NETLIFY_EDGE_BOOTSTRAP = mockURL

    const importLine = getBootstrapImport()
    const match = importLine.match(importURLRegex)
    const url = match?.[1]

    env.NETLIFY_EDGE_BOOTSTRAP = undefined

    if (url === undefined) {
      t.fail('Import expression is invalid')

      return
    }

    t.is(url, mockURL)
  },
)
