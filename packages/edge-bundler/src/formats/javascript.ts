import { promises as fs } from 'fs'
import { join } from 'path'

import del from 'del'

import { DenoBridge } from '../bridge.js'
import type { Bundle } from '../bundle.js'
import { EdgeFunction } from '../edge_function.js'
import { generateEntryPoint } from '../entry_point.js'
import { ImportMap } from '../import_map.js'
import { getFileHash } from '../utils/sha256.js'

interface BundleJSOptions {
  buildID: string
  debug?: boolean
  deno: DenoBridge
  distDirectory: string
  functions: EdgeFunction[]
  importMap: ImportMap
}

const bundleJS = async ({
  buildID,
  debug,
  deno,
  distDirectory,
  functions,
  importMap,
}: BundleJSOptions): Promise<Bundle> => {
  const stage2Path = await generateStage2(functions, distDirectory, `${buildID}-pre.js`)
  const extension = '.js'
  const jsBundlePath = join(distDirectory, `${buildID}${extension}`)
  const flags = [`--import-map=${importMap.toDataURL()}`]

  if (!debug) {
    flags.push('--quiet')
  }

  await deno.run(['bundle', ...flags, stage2Path, jsBundlePath])
  await fs.unlink(stage2Path)

  const hash = await getFileHash(jsBundlePath)

  return { extension, format: 'js', hash }
}

const generateStage2 = async (functions: EdgeFunction[], distDirectory: string, fileName: string) => {
  await del(distDirectory, { force: true })
  await fs.mkdir(distDirectory, { recursive: true })

  const entrypoint = generateEntryPoint(functions)
  const stage2Path = join(distDirectory, fileName)

  await fs.writeFile(stage2Path, entrypoint)

  return stage2Path
}

export { bundleJS, generateStage2 }
