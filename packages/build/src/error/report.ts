import { promisify } from 'util'

import StatsdClient from 'statsd-client'

import { isNetlifyMaintainedPlugin } from '../time/aggregate.js'
import { normalizeTimerName, TOP_PARENT_TAG } from '../time/main.js'

import { getErrorInfo } from './info.js'

// TODO: replace with `timers/promises` after dropping Node < 15.0.0
const pSetTimeout = promisify(setTimeout)

// Record the duration of a build phase, for monitoring.
// Sends to statsd daemon.
export const reportError = async function ({ error, statsdOpts: { host, port }, framework }) {
  if (host === undefined) {
    return
  }

  const [errorInfo] = getErrorInfo(error)
  const pluginName = errorInfo.plugin ? normalizeTimerName(errorInfo.plugin.packageName) : null

  // only send tracking if it is a known plugin
  if (pluginName && !isNetlifyMaintainedPlugin(pluginName)) {
    return
  }

  const parent = pluginName ? pluginName : TOP_PARENT_TAG
  const stage = pluginName ? errorInfo.location?.event : errorInfo.stage
  const client = await startClient(host, port)

  const frameworkTag = framework === undefined ? {} : { framework }
  client.increment('buildbot.build.stage.error', 1, {
    stage: stage ?? 'system',
    parent,
    ...frameworkTag,
  })

  await closeClient(client)
}

// The socket creation is delayed until the first packet is sent. In our
// case, this happens just before `client.close()` is called, which is too
// late and make it not send anything. We need to manually create it using
// the internal API.
const startClient = async function (host: string, port: number): Promise<StatsdClient> {
  const client = new StatsdClient({ host, port, socketTimeout: 0 })

  // @ts-expect-error using internals :D
  await promisify(client._socket._createSocket.bind(client._socket))()

  return client
}

// UDP packets are buffered and flushed at regular intervals by statsd-client.
// Closing force flushing all of them.
const closeClient = async function (client) {
  client.close()

  // statsd-clent does not provide with a way of knowing when the socket is done
  // closing, so we need to use the following hack.
  await pSetTimeout(CLOSE_TIMEOUT)
  await pSetTimeout(CLOSE_TIMEOUT)
}

// See https://github.com/msiebuhr/node-statsd-client/blob/45a93ee4c94ca72f244a40b06cb542d4bd7c3766/lib/EphemeralSocket.js#L81
const CLOSE_TIMEOUT = 11
