import { promises as fs } from 'fs'
import { builtinModules } from 'module'
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
import { rewriteSourceImportAssertions } from '../utils/import_attributes.js'
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

  // Use deno info to get the module graph and identify which local files are actually needed.
  // This avoids copying unnecessary files (like node_modules) that happen to be under commonPath.
  // If module graph analysis fails, fall back to copying files from entry point directories.
  const sourceFiles = await getRequiredSourceFiles(deno, entryPoints, importMap)

  // Find the common path prefix for all source files (entry points + their local imports).
  // This ensures imports to sibling directories (e.g., ../internal/) are included.
  // When using a single file, `commonPathPrefix` returns an empty string, so we use
  // the path of the first entry point's directory.
  const commonPath = commonPathPrefix(sourceFiles) || path.dirname(entryPoints[0])

  // Build the manifest mapping function names to their relative paths
  for (const func of functions) {
    const relativePath = path.relative(commonPath, func.path)
    manifest.functions[func.name] = getUnixPath(relativePath)
  }

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

  // Rewrite bare specifier imports to their resolved URLs so they can be
  // resolved by Deno's --vendor flag at runtime without needing the customer's import map.
  // At runtime, Deno discovers config from /platform/deno.json (the bootstrap entry
  // point), not /function/deno.json, so the customer's import map is unreachable.
  await rewriteBareSpecifiers(bundleDir.path, sourceFiles, commonPath, importMap, prefixes)

  // Deno 2.x dropped support for import for import assertions
  await rewriteImportAssertions(bundleDir.path, sourceFiles, commonPath)

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

// Specifiers provided by the platform deno.json at runtime - no need to rewrite these.
const PLATFORM_SPECIFIERS = new Set(['@netlify/edge-functions', 'netlify:edge'])

// Source file extensions that may contain import statements.
const REWRITABLE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.mts'])

/**
 * Rewrites bare specifier imports in copied source files to their resolved URLs
 * from the import map. This allows Deno's --vendor flag to resolve these imports
 * at runtime without needing the customer's import map (which is unreachable
 * because Deno discovers config from the platform bootstrap directory, not the
 * function directory).
 *
 * Only rewrites specifiers that:
 * - Are bare package specifiers (not relative, absolute, or URL imports)
 * - Resolve to http/https or npm: URLs in the import map
 * - Are NOT node builtins or platform-provided imports
 */
async function rewriteBareSpecifiers(
  bundleDirPath: string,
  sourceFiles: string[],
  commonPath: string,
  importMap: ImportMap,
  prefixes: Record<string, string>,
): Promise<void> {
  const contents = importMap.getContents(prefixes)
  const builtinSet = new Set(builtinModules)

  // Collect bare specifiers that should be rewritten to URLs or relative paths
  const specifierEntries = Object.entries(contents.imports)
    .filter(([specifier, url]) => {
      // Skip node builtins
      if (specifier.startsWith('node:') || builtinSet.has(specifier)) return false
      // Skip platform-provided specifiers (handled by platform deno.json)
      if (PLATFORM_SPECIFIERS.has(specifier)) return false
      // Skip relative/absolute path specifiers in the specifier itself
      if (specifier.startsWith('.') || specifier.startsWith('/')) return false
      // Rewrite http/https, npm:, or vendored npm modules (relative paths with .netlify-npm-vendor)
      if (
        url.startsWith('http://') ||
        url.startsWith('https://') ||
        url.startsWith('npm:') ||
        url.includes('.netlify-npm-vendor')
      ) {
        return true
      }
      return false
    })
    // Sort longest first so prefix mappings like "lodash/" match before "lodash"
    .sort((a, b) => b[0].length - a[0].length)

  for (const sourceFile of sourceFiles) {
    if (!REWRITABLE_EXTENSIONS.has(path.extname(sourceFile))) continue

    const relativePath = path.relative(commonPath, sourceFile)
    const destPath = path.join(bundleDirPath, relativePath)

    let source: string
    try {
      source = await fs.readFile(destPath, 'utf-8')
    } catch {
      continue
    }

    let modified = source

    for (const [specifier, url] of specifierEntries) {
      const escaped = specifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

      // Convert bundle-root-relative paths to source-file-relative paths
      let targetUrl = url
      if (url.startsWith('./') || url.startsWith('../')) {
        // URL is relative to bundle root (e.g., "./.netlify-npm-vendor/bundled-parent-1.js")
        // Convert to absolute path in bundle, then to relative from source file
        const targetAbsolutePath = path.resolve(bundleDirPath, url)
        const relativeImport = path.relative(path.dirname(destPath), targetAbsolutePath)
        // Ensure forward slashes and ./ prefix for clarity
        targetUrl = relativeImport.startsWith('.') ? relativeImport : `./${relativeImport}`
        targetUrl = targetUrl.replace(/\\/g, '/')
      }

      // Escape $ in URL for use in replacement string
      const safeUrl = targetUrl.replace(/\$/g, '$$$$')

      for (const quote of ['"', "'"]) {
        if (specifier.endsWith('/')) {
          // Prefix mapping: "specifier/subpath" -> "url/subpath"
          modified = modified.replace(
            new RegExp(`(\\bfrom\\s+|\\bimport\\s+|\\bimport\\s*\\(\\s*)${quote}${escaped}([^${quote}]*)${quote}`, 'g'),
            `$1${quote}${safeUrl}$2${quote}`,
          )
        } else {
          // Exact mapping: "specifier" -> "url"
          modified = modified.replace(
            new RegExp(`(\\bfrom\\s+|\\bimport\\s+|\\bimport\\s*\\(\\s*)${quote}${escaped}${quote}`, 'g'),
            `$1${quote}${safeUrl}${quote}`,
          )
        }
      }
    }

    if (modified !== source) {
      await fs.writeFile(destPath, modified)
    }
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
): Promise<string[]> {
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

      // Extract all local files from the module graph
      for (const module of graph.modules) {
        if (module.specifier.startsWith('file://')) {
          const filePath = fileURLToPath(module.specifier)
          localFiles.add(filePath)
        }
      }
    } catch {
      // If deno info fails for this entry point, fall back to copying files
      // from its directory
      const dir = path.dirname(entryPoint)
      const files = await listRecursively(dir)
      for (const file of files) {
        localFiles.add(file)
      }
    }
  }

  return Array.from(localFiles).sort()
}

/**
 * Rewrites import assert into import with in the bundle directory
 */
export async function rewriteImportAssertions(
  bundleDirPath: string,
  sourceFiles: string[],
  commonPath: string,
): Promise<void> {
  for (const sourceFile of sourceFiles) {
    if (!REWRITABLE_EXTENSIONS.has(path.extname(sourceFile))) continue

    const relativePath = path.relative(commonPath, sourceFile)
    const destPath = path.join(bundleDirPath, relativePath)

    let source: string

    try {
      source = await fs.readFile(destPath, 'utf-8')
    } catch {
      continue
    }

    const modified = rewriteSourceImportAssertions(source)

    if (modified !== source) {
      await fs.writeFile(destPath, modified)
    }
  }
}
