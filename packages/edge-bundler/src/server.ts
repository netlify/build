import { tmpName } from 'tmp-promise'

import { DenoBridge, LifecycleHook } from './bridge.js'
import { preBundle } from './bundler.js'
import type { Declaration } from './declaration.js'
import { ImportMap, ImportMapFile } from './import_map.js'
import { generateManifest } from './manifest.js'

interface ServeOptions {
  debug?: boolean
  distImportMapPath?: string
  importMaps?: ImportMapFile[]
  onAfterDownload?: LifecycleHook
  onBeforeDownload?: LifecycleHook
}

const serve = async (
  port: number,
  sourceDirectories: string[],
  { debug, distImportMapPath, importMaps, onAfterDownload, onBeforeDownload }: ServeOptions = {},
) => {
  const deno = new DenoBridge({
    onAfterDownload,
    onBeforeDownload,
  })
  const distDirectory = await tmpName()
  const { functions, preBundlePath } = await preBundle(sourceDirectories, distDirectory, 'dev.js')
  const getManifest = (declarations: Declaration[]) =>
    generateManifest({ bundleHash: preBundlePath, declarations, functions })

  // Wait for the binary to be downloaded if needed.
  await deno.getBinaryPath()

  // Creating an ImportMap instance with any import maps supplied by the user,
  // if any.
  const importMap = new ImportMap(importMaps)
  const flags = ['-A', '--unstable', '--no-clear-screen', '--watch', `--import-map=${importMap.toDataURL()}`]

  if (debug) {
    flags.push('--log-level=debug')
  }

  deno.run(['run', ...flags, preBundlePath, port.toString()], { wait: false })

  if (distImportMapPath) {
    await importMap.writeToFile(distImportMapPath)
  }

  return {
    getManifest,
  }
}

export { serve }
