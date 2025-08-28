import { promises as fs } from 'fs'
import path from 'path'

import commonPathPrefix from 'common-path-prefix'
import * as tar from 'tar'
import tmp from 'tmp-promise'

import { DenoBridge } from '../bridge.js'
import { Bundle, BundleFormat } from '../bundle.js'
import { EdgeFunction } from '../edge_function.js'
import { FeatureFlags } from '../feature_flags.js'
import { listRecursively } from '../utils/fs.js'
import { ImportMap } from '../import_map.js'
import { getFileHash } from '../utils/sha256.js'

const TARBALL_EXTENSION = '.tar.gz'

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
  const bundleDir = await tmp.dir({ unsafeCleanup: true })
  const cleanup = [bundleDir.cleanup]

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
      bundleDir.path,
      ...functions.map((func) => func.path),
    ],
    {
      cwd: basePath,
    },
  )

  const manifestPath = path.join(bundleDir.path, '___netlify-edge-functions.json')
  const manifestContents = JSON.stringify(manifest)
  await fs.writeFile(manifestPath, manifestContents)

  const denoConfigPath = path.join(bundleDir.path, 'deno.json')
  const denoConfigContents = JSON.stringify(importMap.getContentsWithRelativePaths())
  await fs.writeFile(denoConfigPath, denoConfigContents)

  const tarballPath = path.join(distDirectory, buildID + TARBALL_EXTENSION)
  await fs.mkdir(path.dirname(tarballPath), { recursive: true })

  // List files to include in the tarball as paths relative to the bundle dir.
  // Using absolute paths here leads to platform-specific quirks (notably on Windows),
  // where entries can include drive letters and break extraction/imports.
  const files = (await listRecursively(bundleDir.path))
    .map((p) => path.relative(bundleDir.path, p))
    .map((p) => getUnixPath(p))
    .sort()

  await tar.create(
    {
      cwd: bundleDir.path,
      file: tarballPath,
      gzip: true,
      noDirRecurse: true,
      // Ensure forward slashes inside the tarball for cross-platform consistency.
      onWriteEntry(entry) {
        entry.path = getUnixPath(entry.path)
      },
    },
    files,
  )

  const hash = await getFileHash(tarballPath)

  await Promise.allSettled(cleanup)

  return {
    extension: TARBALL_EXTENSION,
    format: BundleFormat.TARBALL,
    hash,
  }
}
