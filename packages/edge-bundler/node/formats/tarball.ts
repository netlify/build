import { promises as fs } from 'fs'
import path from 'path'

import * as tar from 'tar'
import tmp from 'tmp-promise'

import { DenoBridge } from '../bridge.js'
import { Bundle, BundleFormat } from '../bundle.js'
import { EdgeFunction } from '../edge_function.js'
import { FeatureFlags } from '../feature_flags.js'
import { ImportMap } from '../import_map.js'
import { getDirectoryHash, getStringHash } from '../utils/sha256.js'

const TARBALL_EXTENSION = '.tar'

interface Manifest {
  functions: Record<string, string>
  version: number
}

interface BundleTarballOptions {
  basePath: string
  buildID: string
  debug?: boolean
  deno: DenoBridge
  distDirectory: string
  featureFlags: FeatureFlags
  functions: EdgeFunction[]
  importMap: ImportMap
  vendorDirectory?: string
}

const getUnixPath = (input: string) => input.split(path.sep).join('/')

export const bundle = async ({
  basePath,
  buildID,
  deno,
  distDirectory,
  functions,
  importMap,
  vendorDirectory,
}: BundleTarballOptions): Promise<Bundle> => {
  const hashes = new Map<string, string>()
  const sideFilesDir = await tmp.dir({ unsafeCleanup: true })
  const cleanup = [sideFilesDir.cleanup]

  let denoDir = vendorDirectory ? path.join(vendorDirectory, 'deno_dir') : undefined

  if (!denoDir) {
    const tmpDir = await tmp.dir({ unsafeCleanup: true })

    denoDir = tmpDir.path

    cleanup.push(tmpDir.cleanup)
  }

  const manifest: Manifest = {
    functions: {},
    version: 1,
  }
  const entrypoints: string[] = []
  const bundledPaths = new Map<string, string>()

  for (const func of functions) {
    const relativePath = path.relative(basePath, func.path)
    const bundledPath = path.format({
      ...path.parse(relativePath),
      base: undefined,
      ext: '.js',
    })

    bundledPaths.set(func.path, bundledPath)
    entrypoints.push(func.path)

    manifest.functions[func.name] = getUnixPath(bundledPath)
  }

  await deno.run(
    [
      'bundle',
      '--import-map',
      importMap.toDataURL(),
      '--quiet',
      '--code-splitting',
      '--outdir',
      distDirectory,
      ...functions.map((func) => func.path),
    ],
    {
      cwd: basePath,
      env: {
        DENO_DIR: denoDir,
      },
    },
  )

  const manifestPath = path.join(sideFilesDir.path, 'manifest.json')
  const manifestContents = JSON.stringify(manifest)
  hashes.set('manifest', getStringHash(manifestContents))
  await fs.writeFile(manifestPath, manifestContents)

  const denoConfigPath = path.join(sideFilesDir.path, 'deno.json')
  const denoConfigContents = JSON.stringify(importMap.getContentsWithRelativePaths())
  hashes.set('config', getStringHash(denoConfigContents))
  await fs.writeFile(denoConfigPath, denoConfigContents)

  const rootLevel = await fs.readdir(distDirectory)
  const hash = await getDirectoryHash(distDirectory)
  const tarballPath = path.join(distDirectory, buildID + TARBALL_EXTENSION)

  await fs.mkdir(path.dirname(tarballPath), { recursive: true })

  await tar.create(
    {
      cwd: distDirectory,
      file: tarballPath,
      preservePaths: true,
      onWriteEntry(entry) {
        if (entry.path === denoConfigPath) {
          entry.path = `./deno.json`

          return
        }

        if (entry.path === manifestPath) {
          entry.path = `./___netlify-edge-functions.json`

          return
        }
      },
    },
    [...rootLevel, manifestPath, denoConfigPath],
  )

  await Promise.all(cleanup)

  return {
    extension: TARBALL_EXTENSION,
    format: BundleFormat.TARBALL,
    hash,
  }
}
