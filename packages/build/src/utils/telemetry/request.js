/* eslint no-process-exit: 0 */
/* Detached child process */
const https = require('https')

const { data, type, version } = JSON.parse(process.argv[2])

const API_HOST = 'telemetry-service.netlify.com'
const API_PATHS = {
  track: '/collect',
  identify: '/identify'
}

const payload = JSON.stringify(data)

const req = https.request(
  {
    hostname: API_HOST,
    path: API_PATHS[type],
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payload.length,
      'X-Netlify-Client': 'NETLIFY_CI',
      'X-Netlify-Client-Version': version
    }
  },
  res => {
    res.on('data', d => {
      process.exit()
    })
  }
)

req.on('error', e => {
  process.exit(1)
})

req.write(payload)
req.end()
