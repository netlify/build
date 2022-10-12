import { ContextOptions, getContext } from './context.js'
import { buildInfo } from './core.js'

export const getBuildInfo = async (opts: ContextOptions) => {
  const context = await getContext(opts)
  return await buildInfo(context)
}
