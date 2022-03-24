import { promises as fs } from 'fs'
import { join, relative } from 'path'
import { env } from 'process'
import { pathToFileURL } from 'url'

import del from 'del'
import { v4 as uuidv4 } from 'uuid'

import { getBootstrapImport } from './bootstrap.js'
import { DenoBridge, LifecycleHook } from './bridge.js'
import type { BundleAlternate } from './bundle_alternate.js'
import type { Declaration } from './declaration.js'
import { EdgeFunction } from './edge_function.js'
import { getESZIPBundler } from './eszip.js'
import { findFunctions } from './finder.js'
import { ImportMap, ImportMapFile } from './import_map.js'
import { generateManifest } from './manifest.js'
import { getFileHash } from './utils/sha256.js'

interface FunctionLine {
  exportLine: string
  importLine: string
}

interface BundleOptions {
  distImportMapPath?: string
  importMaps?: ImportMapFile[]
  onAfterDownload?: LifecycleHook
  onBeforeDownload?: LifecycleHook
}

interface BundleAlternateOptions {
  buildID: string
  deno: DenoBridge
  distDirectory: string
  importMap: ImportMap
  preBundlePath: string
}

const bundle = async (
  sourceDirectories: string[],
  distDirectory: string,
  declarations: Declaration[] = [],
  { distImportMapPath, importMaps, onAfterDownload, onBeforeDownload }: BundleOptions = {},
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
  const { functions, preBundlePath } = await preBundle(sourceDirectories, distDirectory, `${buildID}-pre.js`)
  const bundleAlternates: BundleAlternate[] = ['js']
  const bundleOps = [bundleJS({ buildID, deno, distDirectory, importMap, preBundlePath })]

  if (env.BUNDLE_ESZIP) {
    bundleAlternates.push('eszip2')
    bundleOps.push(bundleESZIP({ buildID, deno, distDirectory, importMap, preBundlePath }))
  }

  const bundleHash = await createFinalBundles(bundleOps, distDirectory, buildID)
  const manifest = await writeManifest({
    bundleAlternates,
    bundleHash,
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

const bundleESZIP = async ({ buildID, deno, distDirectory, preBundlePath }: BundleAlternateOptions) => {
  const extension = '.eszip2'
  const preBundleFileURL = pathToFileURL(preBundlePath).toString()
  const eszipBundlePath = join(distDirectory, `${buildID}${extension}`)
  const bundler = getESZIPBundler()

  await deno.run(['run', '-A', bundler, preBundleFileURL, eszipBundlePath])

  return extension
}

const bundleJS = async ({ buildID, deno, distDirectory, importMap, preBundlePath }: BundleAlternateOptions) => {
  const extension = '.js'
  const jsBundlePath = join(distDirectory, `${buildID}${extension}`)

  await deno.run(['bundle', `--import-map=${importMap.toDataURL()}`, preBundlePath, jsBundlePath])

  return extension
}

const createFinalBundles = async (bundleOps: Promise<string>[], distDirectory: string, buildID: string) => {
  const bundleExtensions = await Promise.all(bundleOps)

  // We want to generate a fingerprint of the functions and their dependencies,
  // so let's compute a SHA256 hash of the bundle. That hash will be different
  // for the various artifacts we produce, so we can just take the first one.
  const bundleHash = await getFileHash(join(distDirectory, `${buildID}${bundleExtensions[0]}`))
  const renameOps = bundleExtensions.map((extension) => {
    const tempBundlePath = join(distDirectory, `${buildID}${extension}`)
    const finalBundlePath = join(distDirectory, `${bundleHash}${extension}`)

    return fs.rename(tempBundlePath, finalBundlePath)
  })

  await Promise.all(renameOps)

  return bundleHash
}

const generateEntrypoint = (functions: EdgeFunction[], distDirectory: string) => {
  const lines = functions.map((func, index) => generateFunctionReference(func, index, distDirectory))
  const bootImport = getBootstrapImport()
  const importLines = lines.map(({ importLine }) => importLine).join('\n')
  const exportLines = lines.map(({ exportLine }) => exportLine).join(', ')
  const exportDeclaration = `const functions = {${exportLines}};`
  const defaultExport = 'boot(functions);'

  return [bootImport, importLines, exportDeclaration, defaultExport].join('\n\n')
}

const generateFunctionReference = (func: EdgeFunction, index: number, targetDirectory: string): FunctionLine => {
  const importName = `func${index}`
  const exportLine = `"${func.name}": ${importName}`
  const relativePath = relative(targetDirectory, func.path)

  return {
    exportLine,
    importLine: `import ${importName} from "${relativePath}";`,
  }
}

const preBundle = async (sourceDirectories: string[], distDirectory: string, preBundleName: string) => {
  await del(distDirectory, { force: true })
  await fs.mkdir(distDirectory, { recursive: true })

  const functions = await findFunctions(sourceDirectories)
  const entrypoint = generateEntrypoint(functions, distDirectory)
  const preBundlePath = join(distDirectory, preBundleName)

  await fs.writeFile(preBundlePath, entrypoint)

  return {
    functions,
    preBundlePath,
  }
}

interface WriteManifestOptions {
  bundleAlternates: BundleAlternate[]
  bundleHash: string
  declarations: Declaration[]
  distDirectory: string
  functions: EdgeFunction[]
}

const writeManifest = ({
  bundleAlternates,
  bundleHash,
  declarations = [],
  distDirectory,
  functions,
}: WriteManifestOptions) => {
  const manifest = generateManifest({ bundleAlternates, bundleHash, declarations, functions })
  const manifestPath = join(distDirectory, 'manifest.json')

  return fs.writeFile(manifestPath, JSON.stringify(manifest))
}

export { bundle, preBundle }
