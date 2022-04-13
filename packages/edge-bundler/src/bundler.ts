import { promises as fs } from 'fs'
import { join } from 'path'

import commonPathPrefix from 'common-path-prefix'
import { v4 as uuidv4 } from 'uuid'

import { DenoBridge, LifecycleHook } from './bridge.js'
import type { Bundle } from './bundle.js'
import type { Declaration } from './declaration.js'
import { FeatureFlags, getFlags } from './feature_flags.js'
import { findFunctions } from './finder.js'
import { bundleESZIP } from './formats/eszip.js'
import { bundleJS } from './formats/javascript.js'
import { ImportMap, ImportMapFile } from './import_map.js'
import { writeManifest } from './manifest.js'

interface BundleOptions {
  cacheDirectory?: string
  debug?: boolean
  distImportMapPath?: string
  featureFlags?: FeatureFlags
  importMaps?: ImportMapFile[]
  onAfterDownload?: LifecycleHook
  onBeforeDownload?: LifecycleHook
}

const bundle = async (
  sourceDirectories: string[],
  distDirectory: string,
  declarations: Declaration[] = [],
  {
    cacheDirectory,
    debug,
    distImportMapPath,
    featureFlags: inputFeatureFlags,
    importMaps,
    onAfterDownload,
    onBeforeDownload,
  }: BundleOptions = {},
) => {
  const featureFlags = getFlags(inputFeatureFlags)
  const deno = new DenoBridge({
    debug,
    cacheDirectory,
    onAfterDownload,
    onBeforeDownload,
  })
  const basePath = getBasePath(sourceDirectories)

  // The name of the bundle will be the hash of its contents, which we can't
  // compute until we run the bundle process. For now, we'll use a random ID
  // to create the bundle artifacts and rename them later.
  const buildID = uuidv4()

  // Creating an ImportMap instance with any import maps supplied by the user,
  // if any.
  const importMap = new ImportMap(importMaps)
  const functions = await findFunctions(sourceDirectories)
  const bundleOps = [
    bundleJS({
      buildID,
      debug,
      deno,
      distDirectory,
      functions,
      importMap,
    }),
  ]

  if (featureFlags.edge_functions_produce_eszip) {
    bundleOps.push(
      bundleESZIP({
        basePath,
        buildID,
        debug,
        deno,
        distDirectory,
        functions,
      }),
    )
  }

  const bundles = await Promise.all(bundleOps)

  // The final file name of the bundles contains a SHA256 hash of the contents,
  // which we can only compute now that the files have been generated. So let's
  // rename the bundles to their permanent names.
  await createFinalBundles(bundles, distDirectory, buildID)

  await writeManifest({
    bundles,
    declarations,
    distDirectory,
    functions,
  })

  if (distImportMapPath) {
    await importMap.writeToFile(distImportMapPath)
  }

  return { functions }
}

const createFinalBundles = async (bundles: Bundle[], distDirectory: string, buildID: string) => {
  const renamingOps = bundles.map(async ({ extension, hash }) => {
    const tempBundlePath = join(distDirectory, `${buildID}${extension}`)
    const finalBundlePath = join(distDirectory, `${hash}${extension}`)

    await fs.rename(tempBundlePath, finalBundlePath)
  })

  await Promise.all(renamingOps)
}

const getBasePath = (sourceDirectories: string[]) => {
  // `common-path-prefix` returns an empty string when called with a single
  // path, so we check for that case and return the path itself instead.
  if (sourceDirectories.length === 1) {
    return sourceDirectories[0]
  }

  return commonPathPrefix(sourceDirectories)
}

export { bundle }
