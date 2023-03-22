import { promises as fs } from 'fs'
import { join, resolve } from 'path'

export const getEdgeFunctionStats = async ({ buildDir, constants: { EDGE_FUNCTIONS_DIST: distDirectory } }) => {
  const edgeFunctionsDistPath = resolve(buildDir, distDirectory)
  const manifestPath = join(edgeFunctionsDistPath, 'manifest.json')
  const data = await fs.readFile(manifestPath)
  // @ts-expect-error TypeScript is not aware that parse can handle Buffer
  const manifestData = JSON.parse(data)
  const numGenEfs = Object.values(manifestData.function_config).filter(
    (config: { generator?: string }) => config.generator,
  ).length
  const totalNumEfs = manifestData.routes.length + manifestData.post_cache_routes.length

  return { num_gen_efs: numGenEfs, total_num_efs: totalNumEfs }
}
