import { join } from 'path'
import { pathToFileURL } from 'url'

import { virtualRoot, virtualVendorRoot } from '../../shared/consts.js'
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

export const extension = '.eszip'

interface BundleESZIPOptions {
  basePath: string
  buildID: string
  debug?: boolean
  deno: DenoBridge
  distDirectory: string
  externals: string[]
  featureFlags: FeatureFlags
  functions: EdgeFunction[]
  importMap: ImportMap
  vendorDirectory?: string
}

export const bundle = async ({
  basePath,
  buildID,
  debug,
  deno,
  distDirectory,
  externals,
  functions,
  importMap,
  vendorDirectory,
}: BundleESZIPOptions): Promise<Bundle> => {
  const destPath = join(distDirectory, `${buildID}${extension}`)
  const importMapPrefixes: Record<string, string> = {
    [`${pathToFileURL(basePath)}/`]: virtualRoot,
  }

  if (vendorDirectory !== undefined) {
    importMapPrefixes[`${pathToFileURL(vendorDirectory)}/`] = virtualVendorRoot
  }

  const { bundler, importMap: bundlerImportMap } = getESZIPPaths()
  const importMapData = JSON.stringify(importMap.getContents(importMapPrefixes))
  const payload: WriteStage2Options = {
    basePath,
    destPath,
    externals,
    functions,
    importMapData,
    vendorDirectory,
  }
  const flags = ['--allow-all', '--no-config', '--no-lock', `--import-map=${bundlerImportMap}`]

  if (!debug) {
    flags.push('--quiet')
  }

  try {
    await deno.run(['run', ...flags, bundler, JSON.stringify(payload)], { pipeOutput: true })
  } catch (error: unknown) {
    throw wrapBundleError(wrapNpmImportError(error), {
      format: 'eszip',
    })
  }

  const hash = await getFileHash(destPath)

  return { extension, format: BundleFormat.ESZIP2, hash }
}

const getESZIPPaths = () => {
  const denoPath = join(getPackagePath(), 'deno')

  return {
    bundler: join(denoPath, 'bundle.ts'),
    extractor: join(denoPath, 'extract.ts'),
    importMap: join(denoPath, 'vendor', 'import_map.json'),
  }
}
