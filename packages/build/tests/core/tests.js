'use strict'

const test = require('ava')

const { runFixture } = require('../helpers/main')
const { startServer } = require('../helpers/server.js')

const CANCEL_PATH = '/api/v1/deploys/test/cancel'

const runWithApiMock = async function (t, flags) {
  const { scheme, host, requests, stopServer } = await startServer({ path: CANCEL_PATH })
  try {
    await runFixture(t, 'cancel', { flags: { apiHost: host, testOpts: { scheme }, ...flags } })
  } finally {
    await stopServer()
  }
  return requests
}

test('--apiHost is used to set Netlify API host', async (t) => {
  const requests = await runWithApiMock(t, { token: 'test', deployId: 'test' })
  t.is(requests.length, 1)
  t.snapshot(requests)
})
