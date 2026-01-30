import { promises as fs } from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

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
  buildID,
  deno,
  distDirectory,
  functions,
  importMap,
  vendorDirectory,
}: BundleTarballOptions): Promise<Bundle> => {
  const bundleDir = await tmp.dir({ unsafeCleanup: true })
  const cleanup = [bundleDir.cleanup]

  const manifest: Manifest = {
    functions: {},
    version: 1,
  }
  const entryPoints = functions.map((func) => func.path)

  // Find the common path prefix for all entry points. When using a single
  // entry point, `commonPathPrefix` returns an empty string, so we use
  // the path of the first entry point's directory.
  const commonPath = commonPathPrefix(entryPoints) || path.dirname(entryPoints[0])

  // Build the manifest mapping function names to their relative paths
  for (const func of functions) {
    const relativePath = path.relative(commonPath, func.path)
    manifest.functions[func.name] = getUnixPath(relativePath)
  }

  // Copy all source files from the common path to the bundle directory first
  const sourceFiles = await listRecursively(commonPath)
  for (const sourceFile of sourceFiles) {
    const relativePath = path.relative(commonPath, sourceFile)
    const destPath = path.join(bundleDir.path, relativePath)

    await fs.mkdir(path.dirname(destPath), { recursive: true })
    await fs.copyFile(sourceFile, destPath)
  }

  // Vendor all dependencies in the bundle directory
  await deno.run(
    [
      'install',
      '--import-map',
      importMap.withNodeBuiltins().toDataURL(),
      '--quiet',
      '--allow-import',
      '--node-modules-dir=manual',
      '--vendor',
      '--entrypoint',
      ...functions.map((func) => path.relative(commonPath, func.path)),
    ],
    {
      cwd: bundleDir.path,
    },
  )

  // Build prefix mappings to transform file:// URLs to relative paths
  const npmVendorDir = '.netlify-npm-vendor'
  const prefixes: Record<string, string> = {}

  // Copy pre-bundled npm modules from vendorDirectory if present.
  // This supports the legacy approach where npm packages are pre-bundled and mapped
  // via import map. Modern code could use npm: specifiers instead, which Deno handles
  // natively via `deno install --vendor`.
  if (vendorDirectory) {
    prefixes[pathToFileURL(vendorDirectory + path.sep).href] = `./${npmVendorDir}/`

    // Copy files from vendor directory
    const vendorFiles = await listRecursively(vendorDirectory)
    for (const vendorFile of vendorFiles) {
      const relativePath = path.relative(vendorDirectory, vendorFile)
      const destPath = path.join(bundleDir.path, npmVendorDir, relativePath)

      await fs.mkdir(path.dirname(destPath), { recursive: true })
      await fs.copyFile(vendorFile, destPath)
    }
  }

  // Map common path to relative paths
  prefixes[pathToFileURL(commonPath + path.sep).href] = './'

  // Get import map contents with file:// URLs transformed to relative paths
  const importMapContents = importMap.getContents(prefixes)

  // Create deno.json with import map contents for runtime resolution
  const denoConfigPath = path.join(bundleDir.path, 'deno.json')
  const denoConfigContents = JSON.stringify(importMapContents)
  await fs.writeFile(denoConfigPath, denoConfigContents)

  const manifestPath = path.join(bundleDir.path, '___netlify-edge-functions.json')
  const manifestContents = JSON.stringify(manifest)
  await fs.writeFile(manifestPath, manifestContents)

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
