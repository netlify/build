import { promises as fs } from 'fs'
import { join, relative } from 'path'

import { DenoBridge, LifecycleHook } from './bridge.js'
import type { Declaration } from './declaration.js'
import { findHandlers } from './finder.js'
import { Handler } from './handler.js'
import { generateManifest } from './manifest.js'
import { getStringHash } from './utils/sha256.js'

interface HandlerLine {
  exportLine: string
  importLine: string
}

interface BundleOptions {
  declarations?: Declaration[]
  onAfterDownload?: LifecycleHook
  onBeforeDownload?: LifecycleHook
}

const bundle = async (
  sourceDirectories: string[],
  distDirectory: string,
  { declarations = [], onAfterDownload, onBeforeDownload }: BundleOptions = {},
) => {
  const deno = new DenoBridge({
    onAfterDownload,
    onBeforeDownload,
  })

  await fs.rm(distDirectory, { force: true, recursive: true })
  await fs.mkdir(distDirectory, { recursive: true })

  const handlers = await findHandlers(sourceDirectories)
  const entrypoint = generateEntrypoint(handlers, distDirectory)
  const entrypointHash = await getStringHash(entrypoint)
  const preBundlePath = join(distDirectory, `${entrypointHash}-pre.js`)
  const bundleFilename = `${entrypointHash}.js`
  const bundlePath = join(distDirectory, bundleFilename)
  const manifest = await writeManifest(bundleFilename, handlers, distDirectory, declarations)

  await fs.writeFile(preBundlePath, entrypoint)
  await deno.run(['bundle', preBundlePath, bundlePath])
  await fs.unlink(preBundlePath)

  return { bundlePath, handlers, manifest, preBundlePath }
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
  const exportLine = `"${handler.name}": ${importName}.handler`
  const relativePath = relative(targetDirectory, handler.path)

  return {
    exportLine,
    importLine: `import * as ${importName} from "${relativePath}";`,
  }
}

const writeManifest = (
  bundleFilename: string,
  handlers: Handler[],
  distDirectory: string,
  declarations: Declaration[] = [],
) => {
  const manifest = generateManifest(bundleFilename, handlers, declarations)
  const manifestPath = join(distDirectory, 'manifest.json')

  return fs.writeFile(manifestPath, JSON.stringify(manifest))
}

export { bundle }
