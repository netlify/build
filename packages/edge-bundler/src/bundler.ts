import { promises as fs } from 'fs'
import { join } from 'path'
import { env } from 'process'
import { pathToFileURL } from 'url'

import del from 'del'
import { v4 as uuidv4 } from 'uuid'

import { DenoBridge, LifecycleHook } from './bridge.js'
import type { Bundle } from './bundle.js'
import type { Declaration } from './declaration.js'
import { EdgeFunction } from './edge_function.js'
import { generateEntryPoint } from './entry_point.js'
import { getESZIPBundler } from './eszip.js'
import { findFunctions } from './finder.js'
import { ImportMap, ImportMapFile } from './import_map.js'
import { generateManifest } from './manifest.js'
import { getFileHash } from './utils/sha256.js'

interface BundleOptions {
  debug?: boolean
  distImportMapPath?: string
  importMaps?: ImportMapFile[]
  onAfterDownload?: LifecycleHook
  onBeforeDownload?: LifecycleHook
}

interface BundleWithFormatOptions {
  buildID: string
  debug?: boolean
  deno: DenoBridge
  distDirectory: string
  importMap: ImportMap
  preBundlePath: string
}

const bundle = async (
  sourceDirectories: string[],
  distDirectory: string,
  declarations: Declaration[] = [],
  { debug, distImportMapPath, importMaps, onAfterDownload, onBeforeDownload }: BundleOptions = {},
) => {
  const deno = new DenoBridge({
    onAfterDownload,
    onBeforeDownload,
  })

  // The name of the bundle will be the hash of its contents, which we can't
  // compute until we run the bundle process. For now, we'll use a random ID
  // to create the bundle artifacts and rename them later.
  const buildID = uuidv4()

  // Creating an ImportMap instance with any import maps supplied by the user,
  // if any.
  const importMap = new ImportMap(importMaps)
  const functions = await findFunctions(sourceDirectories)
  const preBundlePath = await preBundle(functions, distDirectory, `${buildID}-pre.js`)
  const bundleOps = [bundleJS({ debug, buildID, deno, distDirectory, importMap, preBundlePath })]

  if (env.BUNDLE_ESZIP) {
    bundleOps.push(bundleESZIP({ buildID, deno, distDirectory, importMap, preBundlePath }))
  }

  const bundles = await Promise.all(bundleOps)

  await createFinalBundles(bundles, distDirectory, buildID)

  const manifest = await writeManifest({
    bundles,
    declarations,
    distDirectory,
    functions,
  })

  await fs.unlink(preBundlePath)

  if (distImportMapPath) {
    await importMap.writeToFile(distImportMapPath)
  }

  return { functions, manifest, preBundlePath }
}

const bundleESZIP = async ({
  buildID,
  deno,
  distDirectory,
  preBundlePath,
}: BundleWithFormatOptions): Promise<Bundle> => {
  const extension = '.eszip2'
  const preBundleFileURL = pathToFileURL(preBundlePath).toString()
  const eszipBundlePath = join(distDirectory, `${buildID}${extension}`)
  const bundler = getESZIPBundler()

  await deno.run(['run', '-A', bundler, preBundleFileURL, eszipBundlePath])

  const hash = await getFileHash(eszipBundlePath)

  return { extension, format: 'eszip2', hash }
}

const bundleJS = async ({
  buildID,
  debug,
  deno,
  distDirectory,
  importMap,
  preBundlePath,
}: BundleWithFormatOptions): Promise<Bundle> => {
  const extension = '.js'
  const jsBundlePath = join(distDirectory, `${buildID}${extension}`)
  const flags = [`--import-map=${importMap.toDataURL()}`]

  if (!debug) {
    flags.push('--quiet')
  }

  await deno.run(['bundle', ...flags, preBundlePath, jsBundlePath])

  const hash = await getFileHash(jsBundlePath)

  return { extension, format: 'js', hash }
}

const createFinalBundles = async (bundles: Bundle[], distDirectory: string, buildID: string) => {
  const renamingOps = bundles.map(async ({ extension, hash }) => {
    const tempBundlePath = join(distDirectory, `${buildID}${extension}`)
    const finalBundlePath = join(distDirectory, `${hash}${extension}`)

    await fs.rename(tempBundlePath, finalBundlePath)
  })

  await Promise.all(renamingOps)
}

const preBundle = async (functions: EdgeFunction[], distDirectory: string, preBundleName: string) => {
  await del(distDirectory, { force: true })
  await fs.mkdir(distDirectory, { recursive: true })

  const entrypoint = generateEntryPoint(functions)
  const preBundlePath = join(distDirectory, preBundleName)

  await fs.writeFile(preBundlePath, entrypoint)

  return preBundlePath
}

interface WriteManifestOptions {
  bundles: Bundle[]
  declarations: Declaration[]
  distDirectory: string
  functions: EdgeFunction[]
}

const writeManifest = ({ bundles, declarations = [], distDirectory, functions }: WriteManifestOptions) => {
  const manifest = generateManifest({ bundles, declarations, functions })
  const manifestPath = join(distDirectory, 'manifest.json')

  return fs.writeFile(manifestPath, JSON.stringify(manifest))
}

export { bundle, preBundle }
