import type { Tags } from 'hot-shots'

import { isNetlifyMaintainedPlugin } from '../plugins/internal.js'
import {
  closeClient,
  formatTags,
  InputStatsDOptions,
  normalizeTagName,
  startClient,
  validateStatsDOptions,
} from '../report/statsd.js'
import { addBuildErrorToActiveSpan } from '../tracing/main.js'

import { getErrorInfo } from './info.js'
import type { AnyErrorLocation } from './types.js'

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
  addBuildErrorToActiveSpan(error)
  if (!validateStatsDOptions(statsdOpts)) {
    return
  }

  const [errorInfo] = getErrorInfo(error)
  const location: AnyErrorLocation | undefined = errorInfo.location
  const pluginName = errorInfo.plugin ? normalizeTagName(errorInfo.plugin.packageName) : null

  // only send tracking if it is a known plugin
  if (pluginName && !isNetlifyMaintainedPlugin(pluginName)) {
    return
  }

  // Not `??`: an empty plugin name also uses the top parent tag
  const parent = pluginName === null || pluginName === '' ? TOP_PARENT_TAG : pluginName
  const stage = pluginName ? location?.event : errorInfo.stage
  const statsDTags: Tags = { stage: stage ?? 'system', parent }

  // Do not add a framework tag if empty string or null/undefined
  if (framework) {
    statsDTags['framework'] = framework
  }

  const client = await startClient(statsdOpts)

  client.increment('buildbot.build.stage.error', 1, formatTags(statsDTags))

  await closeClient(client)
}
