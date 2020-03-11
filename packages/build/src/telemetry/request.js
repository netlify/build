const {
  env: { TEST_SCHEME, TEST_HOST },
  argv,
} = require('process')

const got = require('got')

const { version } = require('../../package.json')

// Send HTTP request to telemetry.
const sendRequest = async function() {
  const json = JSON.parse(argv[2])
  await got({ ...GOT_OPTS, json: true, body: json })
}

// TODO: find less intrusive way to mock HTTP requests
const SCHEME = TEST_SCHEME || 'https'
const HOST = TEST_HOST || 'telemetry-service.netlify.com'
const GOT_OPTS = {
  url: `${SCHEME}://${HOST}/collect`,
  method: 'POST',
  headers: {
    'X-Netlify-Client': 'NETLIFY_CI',
    'X-Netlify-Client-Version': version,
  },
}

sendRequest()
