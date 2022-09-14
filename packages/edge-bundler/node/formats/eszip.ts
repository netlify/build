import { join, resolve } from 'path'
import { fileURLToPath } from 'url'

import type { WriteStage2Options } from '../../shared/stage2.js'
import { DenoBridge } from '../bridge.js'
import type { Bundle } from '../bundle.js'
import { wrapBundleError } from '../bundle_error.js'
import { EdgeFunction } from '../edge_function.js'
import { ImportMap } from '../import_map.js'
import { getFileHash } from '../utils/sha256.js'

interface BundleESZIPOptions {
  basePath: string
  buildID: string
  debug?: boolean
  deno: DenoBridge
  distDirectory: string
  functions: EdgeFunction[]
  importMap: ImportMap
}

const bundleESZIP = async ({
  basePath,
  buildID,
  debug,
  deno,
  distDirectory,
  functions,
  importMap,
}: BundleESZIPOptions): Promise<Bundle> => {
  const extension = '.eszip'
  const destPath = join(distDirectory, `${buildID}${extension}`)
  const bundler = getESZIPBundler()
  const payload: WriteStage2Options = {
    basePath,
    destPath,
    functions,
    importMapURL: importMap.toDataURL(),
  }
  const flags = ['--allow-all']

  if (!debug) {
    flags.push('--quiet')
  }

  try {
    await deno.run(['run', ...flags, bundler, JSON.stringify(payload)], { pipeOutput: true })
  } catch (error: unknown) {
    throw wrapBundleError(error, { format: 'eszip' })
  }

  const hash = await getFileHash(destPath)

  return { extension, format: 'eszip2', hash }
}

const getESZIPBundler = () => {
  const url = new URL(import.meta.url)
  const pathname = fileURLToPath(url)
  const bundlerPath = resolve(pathname, '../../../deno/bundle.ts')

  return bundlerPath
}

export { bundleESZIP as bundle }
