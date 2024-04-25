import { platform } from 'process'

import got, { OptionsOfTextResponseBody } from 'got'
import osName from 'os-name'

import { addErrorInfo } from '../error/info.js'
import { roundTimerToMillisecs } from '../time/measure.js'
import { ROOT_PACKAGE_JSON } from '../utils/json.js'

const DEFAULT_TELEMETRY_TIMEOUT = 1200
const DEFAULT_TELEMETRY_CONFIG = {
  origin: 'https://api.segment.io/v1',
  writeKey: 'dWhlM1lYSlpNd1k5Uk9rcjFra2JSOEoybnRjZjl0YTI6',
  timeout: { request: DEFAULT_TELEMETRY_TIMEOUT },
}

// Send telemetry request when build completes
export const trackBuildComplete = async function ({
  deployId,
  buildId,
  status,
  stepsCount,
  pluginsOptions,
  durationNs,
  siteInfo,
  telemetry,
  userNodeVersion,
  framework,
  testOpts: { telemetryOrigin = DEFAULT_TELEMETRY_CONFIG.origin, telemetryTimeout = DEFAULT_TELEMETRY_CONFIG.timeout },
}) {
  if (!telemetry) {
    return
  }

  try {
    const payload = getPayload({
      deployId,
      buildId,
      status,
      stepsCount,
      pluginsOptions,
      durationNs,
      siteInfo,
      userNodeVersion,
      framework,
    })
    await track(payload, { ...DEFAULT_TELEMETRY_CONFIG, origin: telemetryOrigin, timeout: telemetryTimeout })
  } catch (error) {
    addErrorInfo(error, { type: 'telemetry' })
    throw error
  }
}

interface TrackConfig {
  origin: string
  writeKey: string
  timeout: OptionsOfTextResponseBody['timeout']
}

// Send track HTTP request to telemetry.
const track = async function (payload: Record<string, unknown>, { origin, writeKey, timeout }: TrackConfig) {
  const url = `${origin}/track`
  await got.post(url, {
    json: payload,
    timeout,
    retry: { limit: 0 },
    headers: { Authorization: `Basic ${writeKey}` },
  })
}

// Retrieve telemetry information
// siteInfo can be empty if the build fails during the get config step
const getPayload = function ({
  deployId,
  buildId,
  status,
  stepsCount,
  pluginsOptions,
  durationNs,
  userNodeVersion,
  siteInfo = { id: undefined },
  framework,
}) {
  return {
    userId: 'buildbot_user',
    event: 'build:ci_build_process_completed',
    timestamp: Date.now(),
    properties: {
      deployId,
      buildId,
      status,
      steps: stepsCount,
      buildVersion: ROOT_PACKAGE_JSON.version,
      // We're passing the node version set by the buildbot/user which will run the `build.command` and
      // the `package.json`/locally defined plugins
      nodeVersion: userNodeVersion,
      osPlatform: OS_TYPES[platform],
      osName: osName(),
      framework,
      siteId: siteInfo.id,
      ...(pluginsOptions !== undefined && {
        plugins: pluginsOptions.map(getPlugin),
        pluginCount: pluginsOptions.length,
      }),
      ...(durationNs !== undefined && { duration: roundTimerToMillisecs(durationNs) }),
    },
  }
}

const OS_TYPES = {
  linux: 'Linux',
  darwin: 'MacOS',
  win32: 'Windows',
  android: 'Android',
  sunos: 'SunOS',
  aix: 'AIX',
  freebsd: 'FreeBSD',
  openbsd: 'OpenBSD',
}

const getPlugin = function ({
  packageName,
  origin,
  loadedFrom,
  nodeVersion,
  pinnedVersion,
  pluginPackageJson: { version } = { version: undefined },
}) {
  const installType = getInstallType(origin, loadedFrom)
  return { name: packageName, installType, nodeVersion, pinnedVersion, version }
}

const getInstallType = function (origin, loadedFrom) {
  if (loadedFrom === 'auto_install') {
    return origin === 'ui' ? 'ui' : 'netlify_toml'
  }

  return loadedFrom
}
