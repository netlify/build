import { join } from 'path'

import type { WriteStage2Options } from '../../shared/stage2.js'
import { DenoBridge } from '../bridge.js'
import { Bundle, BundleFormat } from '../bundle.js'
import { wrapBundleError } from '../bundle_error.js'
import { EdgeFunction } from '../edge_function.js'
import { FeatureFlags } from '../feature_flags.js'
import { ImportMap } from '../import_map.js'
import { wrapNpmImportError } from '../npm_import_error.js'
import { getPackagePath } from '../package_json.js'
import { getFileHash } from '../utils/sha256.js'

interface BundleESZIPOptions {
  basePath: string
  buildID: string
  debug?: boolean
  deno: DenoBridge
  distDirectory: string
  featureFlags: FeatureFlags
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
  const { bundler, importMap: bundlerImportMap } = getESZIPPaths()
  const payload: WriteStage2Options = {
    basePath,
    destPath,
    functions,
    importMapURL: importMap.toDataURL(),
  }
  const flags = ['--allow-all', '--no-config']

  if (!debug) {
    flags.push('--quiet')
  }

  // To actually vendor the eszip module, we need to supply the import map that
  // redirects `https://deno.land/` URLs to the local files.
  flags.push(`--import-map=${bundlerImportMap}`)

  try {
    await deno.run(['run', ...flags, bundler, JSON.stringify(payload)], { pipeOutput: true })
  } catch (error: unknown) {
    throw wrapBundleError(wrapNpmImportError(error), { format: 'eszip' })
  }

  const hash = await getFileHash(destPath)

  return { extension, format: BundleFormat.ESZIP2, hash }
}

const getESZIPPaths = () => {
  const denoPath = join(getPackagePath(), 'deno')

  return {
    bundler: join(denoPath, 'bundle.ts'),
    importMap: join(denoPath, 'vendor', 'import_map.json'),
  }
}

export { bundleESZIP as bundle }
