const {
  env: { BUILD_TELEMETRY_DISABLED, TEST_HOST },
} = require('process')

const Analytics = require('analytics').default
const execa = require('execa')

const { version } = require('../../package.json')
const REQUEST_FILE = `${__dirname}/request.js`

// Send HTTP request to telemetry.
// Telemetry should not impact build speed, so we do not wait for the request
// to complete, by using a child process.
const track = async function({ payload }) {
  if (BUILD_TELEMETRY_DISABLED) {
    return
  }

  const childProcess = execa('node', [REQUEST_FILE, JSON.stringify(payload)], { detached: true, stdio: 'ignore' })

  // During tests, we wait for the HTTP request to complete
  if (TEST_HOST !== undefined) {
    await childProcess
  }
}

const telemetry = Analytics({
  app: 'netlifyCI',
  version,
  plugins: [{ NAMESPACE: 'netlify-telemetry', track }],
})

module.exports = { telemetry }
