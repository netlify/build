import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

import { resolve as importMapResolve } from '@import-maps/resolve'
import { nodeFileTrace, resolve as nftResolve } from '@vercel/nft'
import commonPathPrefix from 'common-path-prefix'
import * as tar from 'tar'
import tmp from 'tmp-promise'

import { DenoBridge } from '../bridge.js'
import { Bundle, BundleFormat } from '../bundle.js'
import { EdgeFunction } from '../edge_function.js'
import { FeatureFlags } from '../feature_flags.js'
import { ImportMap } from '../import_map.js'
import { getStringHash, readFileAndHash } from '../utils/sha256.js'
import { transpile, TYPESCRIPT_EXTENSIONS } from '../utils/typescript.js'
import { ModuleGraphJson } from '../vendor/module_graph/module_graph.js'

const TARBALL_EXTENSION = '.tar'
const TARBALL_SRC_DIRECTORY = 'src'

interface Manifest {
  functions: Record<string, string>
  version: number
}

interface DenoInfoOptions {
  basePath: string
  deno: DenoBridge
  denoDir: string
  entrypoints: string[]
  importMap: ImportMap
}

const getDenoInfo = async ({ basePath, deno, denoDir, entrypoints, importMap }: DenoInfoOptions) => {
  const { stdout } = await deno.run(
    ['info', '--no-lock', '--import-map', importMap.toDataURL(), '--json', ...entrypoints],
    {
      cwd: basePath,
      env: {
        DENO_DIR: denoDir,
      },
    },
  )

  return JSON.parse(stdout) as ModuleGraphJson
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

const resolveHTTPSSpecifier = (moduleGraph: ModuleGraphJson, specifier: string) => {
  for (const mod of moduleGraph.modules) {
    if (mod.specifier === specifier && mod.local) {
      return {
        localPath: mod.local,
        isTypeScript: TYPESCRIPT_EXTENSIONS.has(path.extname(specifier)),
      }
    }
  }
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

  for (const func of functions) {
    entrypoints.push(func.path)

    manifest.functions[func.name] = getUnixPath(path.relative(basePath, func.path))
  }

  const manifestPath = path.join(sideFilesDir.path, 'manifest.json')
  const manifestContents = JSON.stringify(manifest)
  hashes.set('manifest', getStringHash(manifestContents))
  await fs.writeFile(manifestPath, manifestContents)

  const denoConfigPath = path.join(sideFilesDir.path, 'deno.json')
  const denoConfigContents = JSON.stringify(importMap.getContentsWithRelativePaths())
  hashes.set('config', getStringHash(denoConfigContents))
  await fs.writeFile(denoConfigPath, denoConfigContents)

  const tsPaths = new Set<string>()
  const rootDirectory = commonPathPrefix([basePath, denoDir])
  const moduleGraph = await getDenoInfo({
    basePath,
    deno,
    denoDir,
    entrypoints,
    importMap,
  })

  const baseURL = pathToFileURL(basePath)
  const { fileList } = await nodeFileTrace(entrypoints, {
    base: rootDirectory,
    processCwd: basePath,
    readFile: async (filePath: string) => {
      if (TYPESCRIPT_EXTENSIONS.has(path.extname(filePath)) || tsPaths.has(filePath)) {
        const transpiled = await transpile(filePath)

        hashes.set(filePath, getStringHash(transpiled))

        return transpiled
      }

      const { contents, hash } = await readFileAndHash(filePath)

      hashes.set(filePath, hash)

      return contents
    },
    resolve: async (initialSpecifier, ...args) => {
      let specifier = initialSpecifier

      // Start by checking whether the specifier matches any import map defined
      // by the user.
      const { matched, resolvedImport } = importMapResolve(
        initialSpecifier,
        importMap.getContentsWithURLObjects(),
        baseURL,
      )

      // If it does, the resolved import is the specifier we'll evaluate going
      // forward.
      if (matched && resolvedImport?.protocol === 'file:') {
        specifier = fileURLToPath(resolvedImport).replace(/\\/g, '/')
      }

      // If the specifier is an HTTPS import, we need to resolve it to a local
      // file first.
      if (specifier.startsWith('https://')) {
        const resolved = resolveHTTPSSpecifier(moduleGraph, specifier)

        if (resolved) {
          if (resolved.isTypeScript) {
            tsPaths.add(resolved.localPath)
          }

          specifier = resolved.localPath
        }
      }

      return nftResolve(specifier, ...args)
    },
  })

  // Computing a stable hash of the file list.
  const hash = getStringHash(
    [...hashes.keys()]
      .sort()
      .map((path) => hashes.get(path))
      .filter(Boolean)
      .join(','),
  )

  const absolutePaths = [...fileList].map((relativePath) => path.resolve(rootDirectory, relativePath))
  const tarballPath = path.join(distDirectory, buildID + TARBALL_EXTENSION)

  await fs.mkdir(path.dirname(tarballPath), { recursive: true })

  await tar.create(
    {
      cwd: rootDirectory,
      file: tarballPath,
      preservePaths: true,
      onWriteEntry(entry) {
        if (entry.path === denoConfigPath) {
          entry.path = `./${TARBALL_SRC_DIRECTORY}/deno.json`

          return
        }

        if (entry.path === manifestPath) {
          entry.path = `./${TARBALL_SRC_DIRECTORY}/___netlify-edge-functions.json`

          return
        }

        if (entry.path.startsWith(denoDir)) {
          const tarPath = getUnixPath(path.relative(denoDir, entry.path))

          entry.path = `./deno_dir/${tarPath}`

          return
        }

        const tarPath = getUnixPath(path.relative(basePath, entry.path))

        entry.path = `./${TARBALL_SRC_DIRECTORY}/${tarPath}`
      },
    },
    [...absolutePaths, manifestPath, denoConfigPath],
  )

  await Promise.all(cleanup)

  return {
    extension: TARBALL_EXTENSION,
    format: BundleFormat.TARBALL,
    hash,
  }
}
