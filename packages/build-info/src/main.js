import { getContext } from './context.js'
import { buildInfo } from './core.js'

export const getBuildInfo = async function (opts) {
  const context = await getContext(opts)
  return await buildInfo(context)
}
