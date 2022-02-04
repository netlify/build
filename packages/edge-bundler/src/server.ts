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
  const getManifest = (declarations: Declaration[]) => generateManifest(preBundlePath, handlers, declarations)

  // Wait for the binary to be downloaded if needed.
  await deno.getBinaryPath()

  // TODO: Add `--no-clear-screen` when https://github.com/denoland/deno/pull/13454 is released.
  const flags = ['-A', '--unstable', '--watch']

  deno.run(['run', ...flags, preBundlePath, port.toString()], { wait: false })

  return {
    getManifest,
  }
}

export { serve }
