import { promises as fs } from 'fs'
import path from 'path'

import commonPathPrefix from 'common-path-prefix'
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
  const entryPoints = functions.map((func) => func.path)

  // `deno bundle` does not return the paths of the files it emits, so we have
  // to infer them. When multiple entry points are supplied, it will find the
  // common path prefix and use that as the base directory in `outdir`. When
  // using a single entry point, `commonPathPrefix` returns an empty string,
  // so we use the path of the first entry point's directory.
  const commonPath = commonPathPrefix(entryPoints) || path.dirname(entryPoints[0])

  for (const func of functions) {
    const relativePath = path.relative(commonPath, func.path)
    const bundledPath = path.format({
      ...path.parse(relativePath),
      base: undefined,
      ext: '.js',
    })

    manifest.functions[func.name] = getUnixPath(bundledPath)
  }

  await deno.run(
    [
      'bundle',
      '--import-map',
      importMap.withNodeBuiltins().toDataURL(),
      '--quiet',
      '--code-splitting',
      '--outdir',
      distDirectory,
      ...functions.map((func) => func.path),
    ],
    {
      cwd: basePath,
    },
  )

  const manifestPath = path.join(sideFilesDir.path, 'manifest.json')
  const manifestContents = JSON.stringify(manifest)
  await fs.writeFile(manifestPath, manifestContents)

  const denoConfigPath = path.join(sideFilesDir.path, 'deno.json')
  const denoConfigContents = JSON.stringify(importMap.getContentsWithRelativePaths())
  await fs.writeFile(denoConfigPath, denoConfigContents)

  const rootLevel = await fs.readdir(distDirectory)
  const hash = await getDirectoryHash(distDirectory)
  const tarballPath = path.join(distDirectory, buildID + TARBALL_EXTENSION)

  await fs.mkdir(path.dirname(tarballPath), { recursive: true })

  // Adding all the bundled files.
  await tar.create(
    {
      cwd: distDirectory,
      file: tarballPath,
      onWriteEntry(entry) {
        entry.path = getUnixPath(`./${entry.path}`)
      },
    },
    rootLevel,
  )

  // Adding `deno.json`.
  await tar.update(
    {
      cwd: distDirectory,
      file: tarballPath,
      onWriteEntry(entry) {
        entry.path = './deno.json'
      },
    },
    [denoConfigPath],
  )

  // Adding the manifest file.
  await tar.update(
    {
      cwd: distDirectory,
      file: tarballPath,
      onWriteEntry(entry) {
        entry.path = './___netlify-edge-functions.json'
      },
    },
    [manifestPath],
  )

  await Promise.all(cleanup)

  const finalHash = [hash, getStringHash(manifestContents), getStringHash(denoConfigContents)].join('')

  return {
    extension: TARBALL_EXTENSION,
    format: BundleFormat.TARBALL,
    hash: finalHash,
  }
}
