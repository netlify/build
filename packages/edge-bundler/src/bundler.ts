import { promises as fs } from 'fs'
import { join, relative } from 'path'
import { env } from 'process'
import { pathToFileURL } from 'url'

import { v4 as uuidv4 } from 'uuid'

import { DenoBridge, LifecycleHook } from './bridge.js'
import type { BundleAlternate } from './bundle_alternate.js'
import type { Declaration } from './declaration.js'
import { getESZIPBundler } from './eszip.js'
import { findHandlers } from './finder.js'
import { Handler } from './handler.js'
import { ImportMap } from './import_map.js'
import { generateManifest } from './manifest.js'
import { getFileHash } from './utils/sha256.js'

interface HandlerLine {
  exportLine: string
  importLine: string
}

interface BundleOptions {
  importMapPath?: string
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
  { importMapPath, onAfterDownload, onBeforeDownload }: BundleOptions = {},
) => {
  const deno = new DenoBridge({
    onAfterDownload,
    onBeforeDownload,
  })

  // The name of the bundle will be the hash of its contents, which we can't
  // compute until we run the bundle process. For now, we'll use a random ID
  // to create the bundle artifacts and rename them later.
  const buildID = uuidv4()
  const importMap = new ImportMap()
  const { handlers, preBundlePath } = await preBundle(sourceDirectories, distDirectory, `${buildID}-pre.js`)
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
    handlers,
  })

  await fs.unlink(preBundlePath)

  if (importMapPath) {
    await importMap.writeToFile(importMapPath)
  }

  return { handlers, manifest, preBundlePath }
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

  // We want to generate a fingerprint of the handlers and their dependencies,
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

const generateEntrypoint = (handlers: Handler[], distDirectory: string) => {
  const lines = handlers.map((handler, index) => generateHandlerReference(handler, index, distDirectory))
  const bootImport = 'import { boot } from "https://dinosaurs:are-the-future!@edge-bootstrap.netlify.app/index.ts";'
  const importLines = lines.map(({ importLine }) => importLine).join('\n')
  const exportLines = lines.map(({ exportLine }) => exportLine).join(', ')
  const exportDeclaration = `const handlers = {${exportLines}};`
  const defaultExport = 'boot(handlers);'

  return [bootImport, importLines, exportDeclaration, defaultExport].join('\n\n')
}

const generateHandlerReference = (handler: Handler, index: number, targetDirectory: string): HandlerLine => {
  const importName = `handler${index}`
  const exportLine = `"${handler.name}": ${importName}`
  const relativePath = relative(targetDirectory, handler.path)

  return {
    exportLine,
    importLine: `import ${importName} from "${relativePath}";`,
  }
}

const preBundle = async (sourceDirectories: string[], distDirectory: string, preBundleName: string) => {
  await fs.rm(distDirectory, { force: true, recursive: true })
  await fs.mkdir(distDirectory, { recursive: true })

  const handlers = await findHandlers(sourceDirectories)
  const entrypoint = generateEntrypoint(handlers, distDirectory)
  const preBundlePath = join(distDirectory, preBundleName)

  await fs.writeFile(preBundlePath, entrypoint)

  return {
    handlers,
    preBundlePath,
  }
}

interface WriteManifestOptions {
  bundleAlternates: BundleAlternate[]
  bundleHash: string
  declarations: Declaration[]
  distDirectory: string
  handlers: Handler[]
}

const writeManifest = ({
  bundleAlternates,
  bundleHash,
  declarations = [],
  distDirectory,
  handlers,
}: WriteManifestOptions) => {
  const manifest = generateManifest({ bundleAlternates, bundleHash, declarations, handlers })
  const manifestPath = join(distDirectory, 'manifest.json')

  return fs.writeFile(manifestPath, JSON.stringify(manifest))
}

export { bundle, preBundle }
