'use strict'

const { argv } = require('process')

const got = require('got')

const DEFAULT_ORIGIN = 'https://api.segment.io/v1'

// Send HTTP request to telemetry.
const sendRequest = async function () {
  const json = JSON.parse(argv[2])
  const origin = argv[3] || DEFAULT_ORIGIN
  const url = `${origin}/track`
  await got.post(url, {
    json: true,
    body: json,
    headers: { Authorization: 'Basic dWhlM1lYSlpNd1k5Uk9rcjFra2JSOEoybnRjZjl0YTI6' },
  })
}

sendRequest()
