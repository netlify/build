import type { Stats } from 'fs'
import { readFile } from 'fs/promises'

import { startCpio, addCpioFile, endCpio } from './archive.js'
import { Runtime } from './runtimes/runtime.js'

// Create CPIO for a binary function file
export const cpioBinary = async function ({
  destPath,
  filename,
  runtime,
  srcPath,
  stat,
}: {
  destPath: string
  filename: string
  runtime: Runtime
  srcPath: string
  stat: Stats
}) {
  const { archive, output } = startCpio(destPath)

  addCpioFile(archive, srcPath, filename, stat, await readFile(srcPath))
  addCpioFile(archive, 'netlify-toolchain', 'netlify-toolchain', undefined, JSON.stringify({ runtime: runtime.name }))
  await endCpio(archive, output)
}
