const {
  env: { BUILD_TELEMETRY_URL },
  argv,
} = require('process')

const got = require('got')

const { version } = require('../../package.json')

// Send HTTP request to telemetry.
const sendRequest = async function() {
  const json = JSON.parse(argv[2])
  await got({ ...GOT_OPTS, json: true, body: json })
}

const GOT_OPTS = {
  // BUILD_TELEMETRY_URL is used during tests
  url: BUILD_TELEMETRY_URL || 'https://telemetry-service.netlify.com/collect',
  method: 'POST',
  headers: {
    'X-Netlify-Client': 'NETLIFY_CI',
    'X-Netlify-Client-Version': version,
  },
}

sendRequest()
