import { tmpName } from 'tmp-promise'

import { DenoBridge } from './bridge.js'
import { preBundle } from './bundler.js'
import type { Declaration } from './declaration.js'

const serve = async (port: number, sourceDirectories: string[], declarations: Declaration[]) => {
  const deno = new DenoBridge()
  const distDirectory = await tmpName()
  const { preBundlePath } = await preBundle(sourceDirectories, distDirectory)

  console.log({ port })

  return deno.run(['run', '-A', '--unstable', preBundlePath, port.toString()], { wait: false })
}

export { serve }
