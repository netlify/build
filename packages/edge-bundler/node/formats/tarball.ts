import { promises as fs, existsSync } from 'fs'
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
import { EdgeFunctionConfig } from '../index.js'
import { generateManifestRoutes, Route } from '../manifest.js'

const TARBALL_EXTENSION = '.tar.gz'

interface Manifest {
  functions: Record<string, string>
  function_config: Record<string, EdgeFunctionConfig>
  routes: Route[]
  post_cache_routes: Route[]
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

interface FinalizeTarballBundleOptions {
  manifestFunctionConfig: Record<string, EdgeFunctionConfig>
  manifestRoutes: ReturnType<typeof generateManifestRoutes>
}

const getUnixPath = (input: string) => input.split(path.sep).join('/')

// Name of the Deno cache directory (DENO_DIR) we create inside the bundle. The
// runtime points `DENO_DIR` at this directory once the bundle is mounted.
const DENO_DIR_NAME = '.deno_dir'

// The directory (relative to the filesystem root) the bundle is mounted at when
// executed at runtime. Deno keys the transpiled output of local source files by
// their absolute path under `gen/file/`, so cache entries are relocated from the
// (arbitrary) bundling path to this path to remain resolvable at runtime.
const RUNTIME_MOUNT_DIR = 'platform'

interface CreateDenoCacheOptions {
  deno: DenoBridge
  bundleDirPath: string
  denoConfigPath: string
  entrypoints: string[]
}

/**
 * Runs `deno cache` to populate a DENO_DIR inside the bundle, then rewrites it
 * so it's usable from the runtime mount path. The cache lets the runtime skip
 * transpiling (and re-downloading) modules on cold start.
 */
const createDenoCache = async ({ deno, bundleDirPath, denoConfigPath, entrypoints }: CreateDenoCacheOptions) => {
  console.log('[dev-log] Creating Deno cache for tarball bundle...')
  const denoDir = path.join(bundleDirPath, DENO_DIR_NAME)

  // `--vendor` makes Deno resolve dependencies from the vendor directory, just
  // like the runtime does, so the cached output lines up with runtime resolution.
  // `--config` loads the import map from the generated deno.json. `--allow-import`
  // permits fetching from hosts outside Deno's default allow-list (mirroring how
  // the runtime and the vendoring step are invoked).
  await deno.run(['cache', '--allow-import', '--vendor', '--config', denoConfigPath, ...entrypoints], {
    cwd: bundleDirPath,
    denoDir,
  })

  await relocateGenFileCache(bundleDirPath, denoDir)
  await dropAbsolutePathCaches(denoDir)
}

/**
 * Deno stores the transpiled output of local source files under
 * `<DENO_DIR>/gen/file/<absolute source path>`, using the real (symlink-resolved)
 * path. Because the bundle is created at an arbitrary path but mounted at
 * `/<RUNTIME_MOUNT_DIR>` at runtime, we move that subtree so the entries match the
 * runtime paths. Remote and vendored modules are cached under `gen/https/<hash>`
 * (content-addressed) and need no relocation.
 */
const relocateGenFileCache = async (bundleDirPath: string, denoDir: string) => {
  const genFileDir = path.join(denoDir, 'gen', 'file')

  // Deno resolves symlinks before computing the cache path (e.g. on macOS
  // `/var` -> `/private/var`), so we resolve the bundle path the same way to
  // locate the subtree it emitted.
  const realBundleDirPath = await fs.realpath(bundleDirPath)
  const segments = realBundleDirPath.split(path.sep).filter(Boolean)
  const source = path.join(genFileDir, ...segments)
  const destination = path.join(genFileDir, RUNTIME_MOUNT_DIR)

  if (!existsSync(source)) {
    throw new Error(`Expected Deno to emit transpiled local files at ${source}, but the directory was not found`)
  }

  await fs.rename(source, destination)

  // Remove the now-empty leading directories (e.g. `gen/file/private/...`) left
  // behind by the move so they don't end up in the tarball.
  if (segments[0] !== RUNTIME_MOUNT_DIR) {
    await fs.rm(path.join(genFileDir, segments[0]), { recursive: true, force: true })
  }
}

/**
 * Removes Deno's dependency-analysis cache, a SQLite database that keys local
 * modules by absolute path. Its entries wouldn't match the runtime paths, so it
 * would just be dead weight in the tarball; Deno regenerates it on demand.
 */
const dropAbsolutePathCaches = async (denoDir: string) => {
  const entries = await fs.readdir(denoDir)

  await Promise.all(
    entries
      .filter((entry) => entry.startsWith('dep_analysis_cache'))
      .map((entry) => fs.rm(path.join(denoDir, entry), { force: true })),
  )
}

export const bundle = async ({
  buildID,
  deno,
  distDirectory,
  functions,
  importMap,
  vendorDirectory,
}: BundleTarballOptions): Promise<(arg: FinalizeTarballBundleOptions) => Promise<Bundle>> => {
  const bundleDir = await tmp.dir({ unsafeCleanup: true })
  const cleanup = [bundleDir.cleanup]

  const initialManifest: Omit<Manifest, 'function_config' | 'routes' | 'post_cache_routes'> = {
    functions: {},
    version: 2,
  }
  const entryPoints = functions.map((func) => func.path)

  // Use deno info to get the module graph and identify which local files are actually needed.
  // This avoids copying unnecessary files (like node_modules) that happen to be under commonPath.
  const sourceFilesSet = await getRequiredSourceFiles(deno, entryPoints, importMap)

  // Build prefix mappings to transform file:// URLs to relative paths
  const npmVendorDir = '.netlify-npm-vendor'
  const prefixes: Record<string, string> = {}
  const additionalImportMapEntries: Record<string, string> = {}

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

      // Rewrite import assertions in npm vendor directory
      await rewriteImportAssertions(vendorFile, destPath)

      // Remove original bundled npm from source files,
      // rewritten ones will be included in tarball because they will be under bundleDir
      sourceFilesSet.delete(vendorFile)
    }
  }

  // Find the common path prefix for all source files (entry points + their local imports).
  // This ensures imports to sibling directories (e.g., ../internal/) are included.
  // When using a single file, `commonPathPrefix` returns an empty string, so we use
  // the path of the first entry point's directory.
  const commonPath = commonPathPrefix(Array.from(sourceFilesSet).sort()) || path.dirname(entryPoints[0])

  // Build the manifest mapping function names to their relative paths
  for (const func of functions) {
    const relativePath = path.relative(commonPath, func.path)
    initialManifest.functions[func.name] = getUnixPath(relativePath)
  }

  for (const sourceFile of sourceFilesSet) {
    let relativePath = path.relative(commonPath, sourceFile)

    if (relativePath.startsWith('vendor' + path.sep)) {
      // root vendor directory is reserved directory and can't be imported directly from with `vendor: true` or `--vendor` flag
      // move from vendor/ to .root-vendor/
      relativePath = relativePath.replace(/vendor[\\/]/, `.root-vendor/`)
      // and import map rewrite so imports remain resolvable
      additionalImportMapEntries['./vendor/'] = `./.root-vendor/`
      prefixes[pathToFileURL(path.join(commonPath, 'vendor') + path.sep).href] = './.root-vendor/'
    }

    const destPath = path.join(bundleDir.path, relativePath)

    await fs.mkdir(path.dirname(destPath), { recursive: true })

    // Rewrite import assertions in user files
    await rewriteImportAssertions(sourceFile, destPath)
  }

  // Map common path to relative paths
  prefixes[pathToFileURL(commonPath + path.sep).href] = './'

  // Get import map contents with file:// URLs transformed to relative paths
  const importMapContents = importMap.getContents(prefixes, additionalImportMapEntries)

  // Create deno.json with import map contents for runtime resolution
  const denoConfigPath = path.join(bundleDir.path, 'deno.json')
  const denoConfigContents = JSON.stringify(importMapContents, null, 2)
  await fs.writeFile(denoConfigPath, denoConfigContents)

  // Vendor all dependencies in the bundle directory
  await deno.run(
    [
      'install',
      '--import-map',
      denoConfigPath,
      '--quiet',
      '--allow-import',
      '--node-modules-dir=manual',
      '--vendor',
      '--entrypoint',
      ...Object.values(initialManifest.functions),
    ],
    {
      cwd: bundleDir.path,
    },
  )

  // Rewrite import assertions in files outputted by deno vendor
  const denoVendorOutput = path.join(bundleDir.path, 'vendor')
  if (existsSync(denoVendorOutput)) {
    const denoVendorFiles = await listRecursively(denoVendorOutput)
    for (const denoVendorFile of denoVendorFiles) {
      await rewriteImportAssertions(denoVendorFile, denoVendorFile)
    }
  }

  // Produce a Deno cache (DENO_DIR) inside the bundle so the runtime can skip
  // downloading and transpiling modules on cold start, and include it in the
  // tarball.
  await createDenoCache({
    deno,
    bundleDirPath: bundleDir.path,
    denoConfigPath,
    entrypoints: Object.values(initialManifest.functions),
  })

  // First stage of bundling is now done. To finalize bundling we require functionConfig, routes and postCacheRoutes
  // so we could inject those into bundle manifest. Tarball bundling is done in 2-step process process to preserve ordering
  // and potential errors messages that could be thrown to make sure we don't impact behaviors. Otherwise we would throw different
  // kind of errors than we used to and introduce confusion for users.
  return async function finalizeBundle({ manifestFunctionConfig, manifestRoutes }: FinalizeTarballBundleOptions) {
    const manifest: Manifest = {
      ...initialManifest,
      function_config: manifestFunctionConfig,
      routes: manifestRoutes.preCacheRoutes,
      post_cache_routes: manifestRoutes.postCacheRoutes,
    }

    const manifestPath = path.join(bundleDir.path, '___netlify-edge-functions.json')
    const manifestContents = JSON.stringify(manifest)
    await fs.writeFile(manifestPath, manifestContents)

    const tarballPath = path.join(distDirectory, buildID + TARBALL_EXTENSION)
    await fs.mkdir(path.dirname(tarballPath), { recursive: true })

    // List files to include in the tarball as paths relative to the bundle dir.
    // Using absolute paths here leads to platform-specific quirks (notably on Windows),
    // where entries can include drive letters and break extraction/imports.
    // The './' prefix is required to prevent node-tar from interpreting entries
    // starting with '@' as GNU tar archive-include directives, which would cause
    // it to strip the '@' and stat a non-existent path (ENOENT).
    const files = (await listRecursively(bundleDir.path))
      .map((p) => path.relative(bundleDir.path, p))
      .map((p) => './' + getUnixPath(p))
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
}

// Source file extensions that may contain import statements.
const REWRITABLE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.mts'])

/**
 * Uses deno info to get the module graph and extract only the local source files
 * that are actually needed by the entry points. This avoids copying unnecessary
 * files (like node_modules, .next, etc.) that may be under the common path.
 */
async function getRequiredSourceFiles(
  deno: DenoBridge,
  entryPoints: string[],
  importMap: ImportMap,
): Promise<Set<string>> {
  const localFiles = new Set<string>()
  const importMapDataUrl = importMap.withNodeBuiltins().toDataURL()

  // Run deno info for each entry point and combine the results
  for (const entryPoint of entryPoints) {
    const { stdout } = await deno.run([
      'info',
      '--json',
      '--no-config',
      '--import-map',
      importMapDataUrl,
      pathToFileURL(entryPoint).href,
    ])

    const graph = JSON.parse(stdout) as ModuleGraphJson

    // Collect the specifiers of every module reachable through a *code* (runtime)
    // import edge. Deno's module graph classifies each dependency as either a `code`
    // edge (a real runtime import) or a `type`-only edge (`import type`, `@deno-types`).
    // Type-only edges are erased during transpilation and are never loaded at runtime
    // (`deno run` doesn't type-check), so the files they point to don't belong in the
    // bundle. The entry points themselves are always runtime.
    const runtimeSpecifiers = new Set<string>(graph.roots)
    for (const module of graph.modules) {
      for (const dependency of module.dependencies ?? []) {
        if (dependency.code?.specifier) {
          runtimeSpecifiers.add(dependency.code.specifier)
        }
      }
    }

    // Extract all local files from the module graph
    for (const module of graph.modules) {
      if (!module.specifier.startsWith('file://')) {
        continue
      }

      if (module.error) {
        // A module reachable only through type-only edges (e.g. a directory specifier
        // behind `import type`) can fail to resolve as an ES module. That's safe to
        // ignore: the runtime never loads it.
        if (!runtimeSpecifiers.has(module.specifier)) {
          continue
        }

        if (module.error.startsWith('Module not found')) {
          // Module graph contains all found imported/required modules, even if they don't
          // actually exist. This can happen for optional dependencies (dynamic import or
          // require in try/catch).
          continue
        }
      }

      localFiles.add(fileURLToPath(module.specifier))
    }
  }

  return localFiles
}

// WebAssembly binary magic bytes: `\0asm` (0x00 0x61 0x73 0x6d).
const WASM_MAGIC = Buffer.from([0x00, 0x61, 0x73, 0x6d])

/**
 * Detects whether a file is a raw WebAssembly module by its magic bytes.
 * Deno <2.6 vendors imported `.wasm` modules under a `.d.mts` extension even
 * though the content is the raw WASM binary, so we cannot rely on extension
 * alone to decide whether a file is safe to read as UTF-8 and rewrite.
 */
async function isWasm(sourceFile: string): Promise<boolean> {
  const fd = await fs.open(sourceFile, 'r')
  try {
    const buf = Buffer.alloc(WASM_MAGIC.length)
    const { bytesRead } = await fd.read(buf, 0, buf.length, 0)
    return bytesRead === WASM_MAGIC.length && buf.equals(WASM_MAGIC)
  } finally {
    await fd.close()
  }
}

/**
 * Decides whether a source file should be parsed and rewritten. Cheap extension
 * check first; only if it passes do we open the file to rule out raw WebAssembly
 * binaries (Deno <2.6 vendors `.wasm` imports under `.d.mts`) — reading those
 * as UTF-8 would corrupt the binary on round-trip.
 */
async function shouldRewrite(sourceFile: string): Promise<boolean> {
  if (!REWRITABLE_EXTENSIONS.has(path.extname(sourceFile))) {
    return false
  }

  if (await isWasm(sourceFile)) {
    return false
  }

  return true
}

/**
 * Rewrites import assert into import with in the bundle directory
 * Defaults to copying the file in its current form
 */
export async function rewriteImportAssertions(sourceFile: string, destPath: string): Promise<void> {
  if (!(await shouldRewrite(sourceFile))) {
    if (sourceFile !== destPath) {
      await fs.copyFile(sourceFile, destPath)
    }
    return
  }

  try {
    const source = await fs.readFile(sourceFile, 'utf-8')
    const modified = rewriteSourceImportAssertions(source)
    await fs.writeFile(destPath, modified)
  } catch (error) {
    throw new Error(`Failed to rewrite import assertions in ${sourceFile}`, { cause: error })
  }
}
