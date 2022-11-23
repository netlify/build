import { isNetlifyMaintainedPlugin } from '../plugins/internal.js'
import { closeClient, normalizeTagName, startClient } from '../report/statsd.js'

import { getErrorInfo } from './info.js'

const TOP_PARENT_TAG = 'run_netlify_build'

// Record error rates of the build phase for monitoring.
// Sends to statsd daemon.
export const reportError = async function ({
  error,
  statsdOpts: { host, port },
  framework,
}: {
  error: Error
  statsdOpts: { host?: string; port: number }
  framework?: string
}) {
  if (host === undefined) {
    return
  }

  const [errorInfo] = getErrorInfo(error)
  const pluginName = errorInfo.plugin ? normalizeTagName(errorInfo.plugin.packageName) : null

  // only send tracking if it is a known plugin
  if (pluginName && !isNetlifyMaintainedPlugin(pluginName)) {
    return
  }

  const parent = pluginName ? pluginName : TOP_PARENT_TAG
  const stage = pluginName ? errorInfo.location?.event : errorInfo.stage
  const client = await startClient(host, port)

  const frameworkTag: { framework?: string } = framework === undefined ? {} : { framework }
  client.increment('buildbot.build.stage.error', 1, {
    stage: stage ?? 'system',
    parent,
    ...frameworkTag,
  })

  await closeClient(client)
}
