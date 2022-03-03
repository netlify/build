import { promises as fs } from 'fs'
import { join, relative } from 'path'
import { env } from 'process'
import { pathToFileURL } from 'url'

import { DenoBridge, LifecycleHook } from './bridge.js'
import type { BundleAlternate } from './bundle_alternate.js'
import type { Declaration } from './declaration.js'
import { getESZIPBundler } from './eszip.js'
import { findHandlers } from './finder.js'
import { Handler } from './handler.js'
import { generateManifest } from './manifest.js'
import { getStringHash } from './utils/sha256.js'

interface HandlerLine {
  exportLine: string
  importLine: string
}

interface BundleOptions {
  onAfterDownload?: LifecycleHook
  onBeforeDownload?: LifecycleHook
}

const bundle = async (
  sourceDirectories: string[],
  distDirectory: string,
  declarations: Declaration[] = [],
  { onAfterDownload, onBeforeDownload }: BundleOptions = {},
) => {
  const deno = new DenoBridge({
    onAfterDownload,
    onBeforeDownload,
  })

  const { entrypointHash, handlers, preBundlePath } = await preBundle(sourceDirectories, distDirectory)
  const bundlePath = join(distDirectory, entrypointHash)
  const bundleAlternates: BundleAlternate[] = ['js']
  const bundleOps = [bundleJS(deno, preBundlePath, bundlePath)]

  if (env.BUNDLE_ESZIP) {
    bundleAlternates.push('eszip2')
    bundleOps.push(bundleESZIP(deno, preBundlePath, bundlePath))
  }

  const manifest = await writeManifest({
    bundleAlternates,
    bundlePath: entrypointHash,
    declarations,
    distDirectory,
    handlers,
  })

  await Promise.all(bundleOps)
  await fs.unlink(preBundlePath)

  return { handlers, manifest, preBundlePath }
}

const bundleESZIP = (deno: DenoBridge, preBundlePath: string, bundlePath: string) => {
  const preBundleFileURL = pathToFileURL(preBundlePath).toString()
  const eszipBundlePath = `${bundlePath}.eszip2`
  const bundler = getESZIPBundler()

  return deno.run(['run', '-A', bundler, preBundleFileURL, eszipBundlePath])
}

const bundleJS = (deno: DenoBridge, preBundlePath: string, bundlePath: string) => {
  const jsBundlePath = `${bundlePath}.js`

  return deno.run(['bundle', preBundlePath, jsBundlePath])
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

const preBundle = async (sourceDirectories: string[], distDirectory: string) => {
  await fs.rm(distDirectory, { force: true, recursive: true })
  await fs.mkdir(distDirectory, { recursive: true })

  const handlers = await findHandlers(sourceDirectories)
  const entrypoint = generateEntrypoint(handlers, distDirectory)
  const entrypointHash = getStringHash(entrypoint)
  const preBundlePath = join(distDirectory, `${entrypointHash}-pre.js`)

  await fs.writeFile(preBundlePath, entrypoint)

  return {
    entrypointHash,
    handlers,
    preBundlePath,
  }
}

interface WriteManifestOptions {
  bundleAlternates: BundleAlternate[]
  bundlePath: string
  declarations: Declaration[]
  distDirectory: string
  handlers: Handler[]
}

const writeManifest = ({
  bundleAlternates,
  bundlePath,
  declarations = [],
  distDirectory,
  handlers,
}: WriteManifestOptions) => {
  const manifest = generateManifest({ bundleAlternates, bundlePath, declarations, handlers })
  const manifestPath = join(distDirectory, 'manifest.json')

  return fs.writeFile(manifestPath, JSON.stringify(manifest))
}

export { bundle, preBundle }
