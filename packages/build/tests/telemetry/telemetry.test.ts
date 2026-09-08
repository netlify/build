import { versions } from 'process'

import { Fixture, normalizeOutput, startServer, type Request } from '@netlify/testing'
import { expect, test } from 'vitest'

const TELEMETRY_PATH = '/track'
const BUGSNAG_TEST_KEY = '00000000000000000000000000000000'

interface TelemetryPlugin {
  nodeVersion?: string
  version?: string
  [key: string]: unknown
}

interface TelemetryProperties {
  duration?: number
  buildVersion?: string
  osPlatform?: string
  osName?: string
  nodeVersion?: string
  plugins?: TelemetryPlugin[]
  framework?: string
  buildId?: string
  deployId?: string
  [key: string]: unknown
}

interface TelemetryBody {
  timestamp: number
  properties: TelemetryProperties
  [key: string]: unknown
}

const isTelemetryBody = (body: object): body is TelemetryBody => 'properties' in body && 'timestamp' in body

const getTelemetryBody = ({ body }: Request): TelemetryBody => {
  if (typeof body === 'string' || !isTelemetryBody(body)) {
    throw new Error('Telemetry request body is missing "properties" or "timestamp"')
  }
  return body
}

// Normalize telemetry request so it can be snapshot
const normalizeSnapshot = function (request: Request) {
  return { ...request, body: normalizeBody(getTelemetryBody(request)) }
}

const normalizeBody = function ({
  timestamp,
  properties: { duration, buildVersion, osPlatform, osName, nodeVersion, plugins, ...properties },
  ...body
}: TelemetryBody) {
  const optDuration = duration ? { duration: typeof duration } : {}
  return {
    ...body,
    timestamp: typeof timestamp,
    properties: {
      ...properties,
      ...optDuration,
      nodeVersion: typeof nodeVersion,
      buildVersion: typeof buildVersion,
      osPlatform: typeof osPlatform,
      osName: typeof osName,
      ...(plugins !== undefined && { plugins: plugins.map(normalizePlugin) }),
    },
  }
}

const normalizePlugin = function ({ nodeVersion, version, ...plugin }: TelemetryPlugin) {
  return { ...plugin, nodeVersion: typeof nodeVersion, version: typeof version }
}

interface ApiMockOptions {
  env?: Record<string, string>
  snapshot?: boolean
  telemetry?: boolean | null
  telemetryTimeout?: number
  responseStatusCode?: number
  useBinary?: boolean
  waitTelemetryServer?: number
  testOpts?: Record<string, unknown>
  [flag: string]: unknown
}

const runWithApiMock = async function (
  fixture: string,
  {
    env = {},
    snapshot = false,
    telemetry = true,
    // Long default timeout to avoid client side timeout during tests
    telemetryTimeout = 9999,
    responseStatusCode = 200,
    // By default, run build programmatically
    useBinary = false,
    waitTelemetryServer,
    ...flags
  }: ApiMockOptions = {},
) {
  // Start the mock telemetry server
  const {
    scheme: schemeTelemetry,
    host: hostTelemetry,
    requests: telemetryRequests,
    stopServer,
  } = await startServer({
    path: TELEMETRY_PATH,
    wait: waitTelemetryServer,
    status: responseStatusCode,
  })

  const { testOpts = {}, ...restFlags } = flags
  try {
    const fix = new Fixture(import.meta.url, `./fixtures/${fixture}`).withEnv(env).withFlags({
      siteId: 'test',
      testOpts: {
        telemetryOrigin: `${schemeTelemetry}://${hostTelemetry}`,
        telemetryTimeout,
        // Any telemetry errors will be logged
        errorMonitor: true,
        ...testOpts,
      },
      telemetry,
      bugsnagKey: BUGSNAG_TEST_KEY,
      ...restFlags,
    })

    if (useBinary) {
      const { exitCode, output } = await fix.runBuildBinary()

      if (snapshot) {
        expect(normalizeOutput(output)).toMatchSnapshot()
      }
      return { exitCode, telemetryRequests }
    }

    const output = await fix.runWithBuild()
    if (snapshot) {
      expect(normalizeOutput(output)).toMatchSnapshot()
    }

    return { exitCode: undefined, telemetryRequests }
  } finally {
    await stopServer()
  }
}

test('Telemetry success generates no logs', async () => {
  const { telemetryRequests } = await runWithApiMock('success', { snapshot: true })
  expect(telemetryRequests).toHaveLength(1)
})

test('Telemetry error only reports to error monitor and does not affect build success', async () => {
  const { exitCode } = await runWithApiMock('success', {
    responseStatusCode: 500,
    // Execute via cli so that we can validate the exitCode
    useBinary: true,
    snapshot: true,
  })
  expect(exitCode).toBe(0)
})

test('Telemetry reports build success', async () => {
  const { telemetryRequests } = await runWithApiMock('success')
  const snapshot = telemetryRequests.map(normalizeSnapshot)
  expect(snapshot).toMatchSnapshot()
})

test('Telemetry reports local plugins success', async () => {
  const { telemetryRequests } = await runWithApiMock('plugin_success')
  const snapshot = telemetryRequests.map(normalizeSnapshot)
  expect(snapshot).toMatchSnapshot()
})

test('Telemetry reports package.json plugins success', async () => {
  const { telemetryRequests } = await runWithApiMock('plugin_package')
  const snapshot = telemetryRequests.map(normalizeSnapshot)
  expect(snapshot).toMatchSnapshot()
})

test('Telemetry reports netlify.toml-only plugins success', async () => {
  const { telemetryRequests } = await runWithApiMock('plugins_cache_config', {
    testOpts: { pluginsListUrl: undefined },
  })
  const snapshot = telemetryRequests.map(normalizeSnapshot)
  expect(snapshot).toMatchSnapshot()
})

test('Telemetry reports UI plugins success', async () => {
  const { telemetryRequests } = await runWithApiMock('plugins_cache_ui', {
    defaultConfig: { plugins: [{ package: 'netlify-plugin-contextual-env' }] },
    testOpts: { pluginsListUrl: undefined },
  })
  const snapshot = telemetryRequests.map(normalizeSnapshot)
  expect(snapshot).toMatchSnapshot()
})

test('Telemetry reports build cancellation', async () => {
  const { telemetryRequests } = await runWithApiMock('cancel')
  const snapshot = telemetryRequests.map(normalizeSnapshot)
  expect(snapshot).toMatchSnapshot()
})

test('Telemetry reports user error', async () => {
  const { telemetryRequests } = await runWithApiMock('invalid')
  const snapshot = telemetryRequests.map(normalizeSnapshot)
  expect(snapshot).toMatchSnapshot()
})

test('Telemetry reports plugin error', async () => {
  const { telemetryRequests } = await runWithApiMock('plugin_error')
  const snapshot = telemetryRequests.map(normalizeSnapshot)
  expect(snapshot).toMatchSnapshot()
})

test('Telemetry is disabled by default', async () => {
  // We're just overriding our default test harness behaviour
  const { telemetryRequests } = await runWithApiMock('success', { telemetry: null })
  expect(telemetryRequests).toHaveLength(0)
})

test('Telemetry BUILD_TELEMETRY_DISABLED env var overrides flag', async () => {
  const { telemetryRequests } = await runWithApiMock('success', {
    env: { BUILD_TELEMETRY_DISABLED: 'true' },
  })
  expect(telemetryRequests).toHaveLength(0)
})

test('Telemetry node version reported is based on the version provided by the user', async () => {
  const nodeVersion = '8.8.0'
  const { telemetryRequests } = await runWithApiMock('success', {
    nodePath: `/test/.nvm/versions/node/v${nodeVersion}/bin/node`,
  })
  expect(telemetryRequests).toHaveLength(1)
  expect(getTelemetryBody(telemetryRequests[0]).properties.nodeVersion).toBe(nodeVersion)
})

test('Telemetry node version reported is based on the current process version if none is provided', async () => {
  const { telemetryRequests } = await runWithApiMock('success')
  expect(telemetryRequests).toHaveLength(1)
  expect(getTelemetryBody(telemetryRequests[0]).properties.nodeVersion).toBe(versions.node)
})

test('Telemetry reports a framework if any is given', async () => {
  const framework = 'gatsby'
  const { telemetryRequests } = await runWithApiMock('success', { framework })
  expect(telemetryRequests).toHaveLength(1)
  expect(getTelemetryBody(telemetryRequests[0]).properties.framework).toBe(framework)
})

test('Telemetry reports no framework if none is provided', async () => {
  const { telemetryRequests } = await runWithApiMock('success')
  expect(telemetryRequests).toHaveLength(1)
  expect(getTelemetryBody(telemetryRequests[0]).properties.framework).toBe(undefined)
})

test('Telemetry reports the build id if given via BUILD_ID', async () => {
  const buildId = 'test-build-id'
  const { telemetryRequests } = await runWithApiMock('success', { env: { BUILD_ID: buildId } })
  expect(telemetryRequests).toHaveLength(1)
  expect(getTelemetryBody(telemetryRequests[0]).properties.buildId).toBe(buildId)
})

test('Telemetry reports a deploy id if given via DEPLOY_ID', async () => {
  const deployId = 'test-deploy-id'
  const { telemetryRequests } = await runWithApiMock('success', { env: { DEPLOY_ID: deployId } })
  expect(telemetryRequests).toHaveLength(1)
  expect(getTelemetryBody(telemetryRequests[0]).properties.deployId).toBe(deployId)
})

test('Telemetry reports a deploy id if given via --deployId flag', async () => {
  const deployId = 'test-deploy-id'
  const { telemetryRequests } = await runWithApiMock('success', { deployId })
  expect(telemetryRequests).toHaveLength(1)
  expect(getTelemetryBody(telemetryRequests[0]).properties.deployId).toBe(deployId)
})

test('Telemetry calls timeout by default', async () => {
  const { telemetryRequests } = await runWithApiMock('success', {
    // Force a client side timeout
    telemetryTimeout: 0,
    waitTelemetryServer: 1000,
    // The error monitor snapshot should contain the timeout error
    snapshot: true,
  })
  expect(telemetryRequests).toHaveLength(0)
})
