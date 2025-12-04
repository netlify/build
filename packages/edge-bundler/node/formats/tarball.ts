import { promises as fs } from 'fs'
import path from 'path'
import { transformImportAssertionsToAttributes } from './import-assertions-to-attributes.js'

import cpy from 'cpy'
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
  let bundleDir = await tmp.dir({ unsafeCleanup: true })
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

  const runBundle = async (entryPaths: string[]) => {
    await deno.run(
      [
        'bundle',
        '--import-map',
        importMap.withNodeBuiltins().toDataURL(),
        '--quiet',
        '--code-splitting',
        '--allow-import',
        '--node-modules-dir=manual',
        '--outdir',
        bundleDir.path,
        ...entryPaths,
      ],
      {
        cwd: basePath,
      },
    )
  }

  try {
    await runBundle(entryPoints)
  } catch (error) {
    if (!isImportAssertionError(error)) {
      throw error
    }

    // Deno 2.x errors on import assertions, so retry with a temporary copy that rewrites them to `with`.
    const compatSourceDir = await createCompatSourceCopy(commonPath)
    cleanup.push(compatSourceDir.cleanup)

    bundleDir = await tmp.dir({ unsafeCleanup: true })
    cleanup.push(bundleDir.cleanup)

    const compatEntryPoints = entryPoints.map((entryPoint) =>
      path.join(compatSourceDir.path, path.relative(commonPath, entryPoint)),
    )

    await runBundle(compatEntryPoints)
  }

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

const IMPORT_ASSERTION_ERROR_MESSAGES = ['Import assertions are deprecated', `Unexpected identifier 'assert'`]

const isImportAssertionError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return false
  }

  const stderr =
    typeof (error as { stderr?: unknown }).stderr === 'string' ? (error as { stderr?: unknown }).stderr : ''
  const shortMessage =
    typeof (error as { shortMessage?: unknown }).shortMessage === 'string'
      ? (error as { shortMessage?: string }).shortMessage
      : ''
  const combinedMessage = [error.message, shortMessage, stderr].join('\n')

  return IMPORT_ASSERTION_ERROR_MESSAGES.some((message) => combinedMessage.includes(message))
}

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(full)
    else if (/\.(mjs|cjs|js|ts|tsx|jsx)$/.test(entry.name)) yield full
  }
}

const createCompatSourceCopy = async (commonPath: string) => {
  const compatSourceDir = await tmp.dir({ unsafeCleanup: true })
  await cpy(path.join(commonPath, '**'), compatSourceDir.path, {
    dot: true,
  })

  for await (const file of walk(compatSourceDir.path)) {
    const code = await fs.readFile(file, 'utf8')
    const next = transformImportAssertionsToAttributes(code)
    if (next !== code) {
      await fs.writeFile(file, next, 'utf8')
    }
  }
  return compatSourceDir
}
