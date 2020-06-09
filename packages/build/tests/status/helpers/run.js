const { runFixture } = require('../../helpers/main')
const { startServer } = require('../../helpers/server')

const STATUS_PATH = '/api/v1/deploys/test/plugin_runs'

// Normalize API request body so it can be snapshot in a stable way
const normalizeRequest = function({ body: { version, text, ...body }, ...request }) {
  const versionA = version.replace(VERSION_REGEXP, '1.0.0')
  const textA = normalizeText(text)
  return { ...request, body: { ...body, version: versionA, text: textA } }
}

const normalizeText = function(text) {
  if (typeof text !== 'string') {
    return text
  }

  return text
    .replace(STACK_TRACE_REGEXP, '')
    .replace(WHITESPACE_REGEXP, ' ')
    .trim()
}

const VERSION_REGEXP = /\d+\.\d+\.\d+/g
const STACK_TRACE_REGEXP = /^\s+at .*/gm
const WHITESPACE_REGEXP = /\s+/g

const comparePackage = function({ body: { package: packageA } }, { body: { package: packageB } }) {
  return packageA < packageB ? -1 : 1
}

const runWithApiMock = async function(t, fixture, { flags = { token: 'test' }, status } = {}) {
  const { scheme, host, requests, stopServer } = await startServer(STATUS_PATH, {}, { status })
  await runFixture(t, fixture, {
    flags: { deployId: 'test', ...flags, testOpts: { scheme, host, sendStatus: true } },
  })
  await stopServer()
  const snapshots = requests.map(normalizeRequest).sort(comparePackage)
  t.snapshot(snapshots)
}

module.exports = { runWithApiMock }
