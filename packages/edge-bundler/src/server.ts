import { tmpName } from 'tmp-promise'

import { DenoBridge, LifecycleHook } from './bridge.js'
import { preBundle } from './bundler.js'
import type { Declaration } from './declaration.js'
import { ImportMap } from './import_map.js'
import { generateManifest } from './manifest.js'

interface ServeOptions {
  importMapPath?: string
  onAfterDownload?: LifecycleHook
  onBeforeDownload?: LifecycleHook
}

const serve = async (
  port: number,
  sourceDirectories: string[],
  { importMapPath, onAfterDownload, onBeforeDownload }: ServeOptions = {},
) => {
  const deno = new DenoBridge({
    onAfterDownload,
    onBeforeDownload,
  })
  const distDirectory = await tmpName()
  const { handlers, preBundlePath } = await preBundle(sourceDirectories, distDirectory, 'dev.js')
  const getManifest = (declarations: Declaration[]) =>
    generateManifest({ bundleHash: preBundlePath, declarations, handlers })

  // Wait for the binary to be downloaded if needed.
  await deno.getBinaryPath()

  const importMap = new ImportMap()
  const flags = ['-A', '--unstable', '--no-clear-screen', '--watch', `--import-map=${importMap.toDataURL()}`]

  deno.run(['run', ...flags, preBundlePath, port.toString()], { wait: false })

  if (importMapPath) {
    await importMap.writeToFile(importMapPath)
  }

  return {
    getManifest,
  }
}

export { serve }
