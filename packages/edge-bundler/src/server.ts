import { tmpName } from 'tmp-promise'

import { DenoBridge, LifecycleHook } from './bridge.js'
import { preBundle } from './bundler.js'
import type { Declaration } from './declaration.js'
import { generateManifest } from './manifest.js'

interface ServeOptions {
  onAfterDownload?: LifecycleHook
  onBeforeDownload?: LifecycleHook
}

const serve = async (
  port: number,
  sourceDirectories: string[],
  { onAfterDownload, onBeforeDownload }: ServeOptions = {},
) => {
  const deno = new DenoBridge({
    onAfterDownload,
    onBeforeDownload,
  })
  const distDirectory = await tmpName()
  const { handlers, preBundlePath } = await preBundle(sourceDirectories, distDirectory)
  const getManifest = (declarations: Declaration[]) =>
    generateManifest({ bundlePath: preBundlePath, declarations, handlers })

  // Wait for the binary to be downloaded if needed.
  await deno.getBinaryPath()

  const flags = ['-A', '--unstable', '--no-clear-screen', '--watch', '--no-prompt']

  deno.run(['run', ...flags, preBundlePath, port.toString()], { wait: false })

  return {
    getManifest,
  }
}

export { serve }
