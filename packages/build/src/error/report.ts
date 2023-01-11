import { isNetlifyMaintainedPlugin } from '../plugins/internal.js'
import {
  closeClient,
  InputStatsDOptions,
  normalizeTagName,
  startClient,
  validateStatsDOptions,
} from '../report/statsd.js'

import { getErrorInfo } from './info.js'

const TOP_PARENT_TAG = 'run_netlify_build'

/**
 * Record error rates of the build phase for monitoring.
 * Sends to statsd daemon.
 */
export const reportError = async function (
  error: Error,
  statsdOpts: InputStatsDOptions,
  framework?: string,
): Promise<void> {
  if (!validateStatsDOptions(statsdOpts)) {
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
  const client = await startClient(statsdOpts)

  const frameworkTag: { framework?: string } = framework === undefined ? {} : { framework }
  client.increment('buildbot.build.stage.error', 1, {
    stage: stage ?? 'system',
    parent,
    ...frameworkTag,
  })

  await closeClient(client)
}
