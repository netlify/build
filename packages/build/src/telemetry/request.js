const { argv } = require('process')

const got = require('got')

const { version } = require('../../package.json')

// Send HTTP request to telemetry.
const sendRequest = async function() {
  const json = JSON.parse(argv[2])
  const origin = argv[3] || DEFAULT_ORIGIN
  const url = `${origin}/collect`
  await got({ ...GOT_OPTS, url, body: json })
}

const DEFAULT_ORIGIN = 'https://telemetry-service.netlify.com'
const GOT_OPTS = {
  method: 'POST',
  headers: {
    'X-Netlify-Client': 'NETLIFY_CI',
    'X-Netlify-Client-Version': version,
  },
  json: true,
}

sendRequest()
