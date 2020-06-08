const Analytics = require('analytics').default
const execa = require('execa')

const { version } = require('../../package.json')
const REQUEST_FILE = `${__dirname}/request.js`

// Send HTTP request to telemetry.
// Telemetry should not impact build speed, so we do not wait for the request
// to complete, by using a child process.
// We also ignore any errors. Those might happen for example if the current
// directory was removed by the build command.
const track = async function({
  payload: {
    properties: { telemetry, testOpts: { telemetryOrigin = '' } = {}, payload: properties } = {},
    ...payload
  } = {},
}) {
  if (!telemetry) {
    return
  }

  const payloadA = { ...payload, properties }
  try {
    const childProcess = execa('node', [REQUEST_FILE, JSON.stringify(payloadA), telemetryOrigin], {
      detached: true,
      stdio: 'ignore',
    })

    // During tests, we wait for the HTTP request to complete
    if (telemetryOrigin === '') {
      childProcess.unref()
    }

    await childProcess
  } catch (error) {
    return
  }
}

const analytics = Analytics({
  app: 'netlifyCI',
  version,
  plugins: [{ NAMESPACE: 'netlify-telemetry', track }],
})

module.exports = { analytics }
