import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

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
import type { ModuleGraphJson } from '../vendor/module_graph/module_graph.js'

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

  // Use deno info to get the module graph and identify which local files are actually needed.
  // This avoids copying unnecessary files (like node_modules) that happen to be under commonPath.
  // If module graph analysis fails, fall back to copying files from entry point directories.
  const sourceFiles = await getRequiredSourceFiles(deno, entryPoints, importMap, commonPath)
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
      '--no-npm',
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

/**
 * Uses deno info to get the module graph and extract only the local source files
 * that are actually needed by the entry points. This avoids copying unnecessary
 * files (like node_modules, .next, etc.) that may be under the common path.
 *
 * If deno info fails, falls back to copying files from the directories containing
 * the entry points (not the entire common path).
 */
async function getRequiredSourceFiles(
  deno: DenoBridge,
  entryPoints: string[],
  importMap: ImportMap,
  commonPath: string,
): Promise<string[]> {
  const commonPathUrl = pathToFileURL(commonPath + path.sep).href
  const localFiles = new Set<string>()
  const importMapDataUrl = importMap.withNodeBuiltins().toDataURL()

  // Run deno info for each entry point and combine the results
  for (const entryPoint of entryPoints) {
    try {
      const { stdout } = await deno.run([
        'info',
        '--json',
        '--import-map',
        importMapDataUrl,
        pathToFileURL(entryPoint).href,
      ])

      const graph = JSON.parse(stdout) as ModuleGraphJson

      // Extract local files from the module graph
      for (const module of graph.modules) {
        // Only include local file:// URLs that are under the common path
        if (module.specifier.startsWith('file://') && module.specifier.startsWith(commonPathUrl)) {
          const filePath = fileURLToPath(module.specifier)
          localFiles.add(filePath)
        }
      }
    } catch {
      // If deno info fails for this entry point, fall back to copying files
      // from its directory
      const dir = path.dirname(entryPoint)
      if (dir.startsWith(commonPath)) {
        const files = await listRecursively(dir)
        for (const file of files) {
          localFiles.add(file)
        }
      }
    }
  }

  return Array.from(localFiles).sort()
}
