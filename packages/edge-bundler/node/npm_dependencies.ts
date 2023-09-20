import { promises as fs } from 'fs'
import { builtinModules, createRequire } from 'module'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

import { resolve, ParsedImportMap } from '@import-maps/resolve'
import { build, OnResolveResult, Plugin } from 'esbuild'
import tmp from 'tmp-promise'

import { nodePrefix, npmPrefix } from '../shared/consts.js'

import { ImportMap } from './import_map.js'
import { Logger } from './logger.js'

const builtinModulesSet = new Set(builtinModules)
const require = createRequire(import.meta.url)

// Workaround for https://github.com/evanw/esbuild/issues/1921.
const banner = {
  js: `
  import {createRequire as ___nfyCreateRequire} from "node:module";
  import {fileURLToPath as ___nfyFileURLToPath} from "node:url";
  import {dirname as ___nfyPathDirname} from "node:path";
  let __filename=___nfyFileURLToPath(import.meta.url);
  let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
  let require=___nfyCreateRequire(import.meta.url);
  `,
}

// esbuild plugin that will traverse the code and look for imports of external
// dependencies (i.e. Node modules). It stores the specifiers found in the Set
// provided.
export const getDependencyTrackerPlugin = (
  specifiers: Set<string>,
  importMap: ParsedImportMap,
  baseURL: URL,
): Plugin => ({
  name: 'dependency-tracker',
  setup(build) {
    build.onResolve({ filter: /^(.*)$/ }, (args) => {
      if (args.kind !== 'import-statement') {
        return
      }

      const result: Partial<OnResolveResult> = {}

      let specifier = args.path

      // Start by checking whether the specifier matches any import map defined
      // by the user.
      const { matched, resolvedImport } = resolve(specifier, importMap, baseURL)

      // If it does, the resolved import is the specifier we'll evaluate going
      // forward.
      if (matched) {
        specifier = fileURLToPath(resolvedImport).replace(/\\/g, '/')

        result.path = specifier
      }

      // If the specifier is a Node.js built-in, we don't want to bundle it.
      if (specifier.startsWith(nodePrefix) || builtinModulesSet.has(specifier)) {
        return { external: true }
      }

      // We don't support the `npm:` prefix yet. Mark the specifier as external
      // and the ESZIP bundler will handle the failure.
      if (specifier.startsWith(npmPrefix)) {
        return { external: true }
      }

      const isLocalImport = specifier.startsWith(path.sep) || specifier.startsWith('.')

      // If this is a local import, return so that esbuild visits that path.
      if (isLocalImport) {
        return result
      }

      const isRemoteURLImport = specifier.startsWith('https://') || specifier.startsWith('http://')

      if (isRemoteURLImport) {
        return { external: true }
      }

      // At this point we know we're dealing with a bare specifier that should
      // be treated as an external module. We first try to resolve it, because
      // in the event that it doesn't exist (e.g. user is referencing a module
      // that they haven't installed) we won't even attempt to bundle it. This
      // lets the ESZIP bundler handle and report the missing import instead of
      // esbuild, which is a better experience for the user.
      try {
        require.resolve(specifier, { paths: [args.resolveDir] })

        specifiers.add(specifier)
      } catch {
        // no-op
      }

      // Mark the specifier as external, because we don't want to traverse the
      // entire module tree — i.e. if user code imports module `foo` and that
      // imports `bar`, we only want to add `foo` to the list of specifiers,
      // since the whole module — including its dependencies like `bar` —
      // will be bundled.
      return { external: true }
    })
  },
})

interface VendorNPMSpecifiersOptions {
  basePath: string
  directory?: string
  functions: string[]
  importMap: ImportMap
  logger: Logger
}

export const vendorNPMSpecifiers = async ({
  basePath,
  directory,
  functions,
  importMap,
  logger,
}: VendorNPMSpecifiersOptions) => {
  const specifiers = new Set<string>()

  // The directories that esbuild will use when resolving Node modules. We must
  // set these manually because esbuild will be operating from a temporary
  // directory that will not live inside the project root, so the normal
  // resolution logic won't work.
  const nodePaths = [path.join(basePath, 'node_modules')]

  // We need to create some files on disk, which we don't want to write to the
  // project directory. If a custom directory has been specified, we use it.
  // Otherwise, create a random temporary directory.
  const temporaryDirectory = directory ? { path: directory } : await tmp.dir()

  // Do a first pass at bundling to gather a list of specifiers that should be
  // loaded as npm dependencies, because they either use the `npm:` prefix or
  // they are bare specifiers. We'll collect them in `specifiers`.
  try {
    await build({
      banner,
      bundle: true,
      entryPoints: functions,
      logLevel: 'error',
      nodePaths,
      outdir: temporaryDirectory.path,
      platform: 'node',
      plugins: [getDependencyTrackerPlugin(specifiers, importMap.getContentsWithURLObjects(), pathToFileURL(basePath))],
      write: false,
    })
  } catch (error) {
    logger.system('Could not track dependencies in edge function:', error)
    logger.user(
      'An error occurred when trying to scan your edge functions for npm modules, which is an experimental feature. If you are loading npm modules, please share the errors above in https://ntl.fyi/edge-functions-npm. If you are not loading npm modules, you can ignore this message.',
    )
  }

  // If we found no specifiers, there's nothing left to do here.
  if (specifiers.size === 0) {
    return
  }

  logger.user(
    'You are using npm modules in Edge Functions, which is an experimental feature. Learn more at https://ntl.fyi/edge-functions-npm.',
  )

  // To bundle an entire module and all its dependencies, create a barrel file
  // where we re-export everything from that specifier. We do this for every
  // specifier, and each of these files will become entry points to esbuild.
  const ops = await Promise.all(
    [...specifiers].map(async (specifier, index) => {
      const code = `import * as mod from "${specifier}"; export default mod.default; export * from "${specifier}";`
      const filePath = path.join(temporaryDirectory.path, `barrel-${index}.js`)

      await fs.writeFile(filePath, code)

      return { filePath, specifier }
    }),
  )
  const entryPoints = ops.map(({ filePath }) => filePath)

  // Bundle each of the barrel files we created. We'll end up with a compiled
  // version of each of the barrel files, plus any chunks of shared code
  // between them (such that a common module isn't bundled twice).
  await build({
    allowOverwrite: true,
    banner,
    bundle: true,
    entryPoints,
    format: 'esm',
    logLevel: 'error',
    nodePaths,
    outdir: temporaryDirectory.path,
    platform: 'node',
    splitting: true,
    target: 'es2020',
  })

  // Add all Node.js built-ins to the import map, so any unprefixed specifiers
  // (e.g. `process`) resolve to the prefixed versions (e.g. `node:prefix`),
  // which Deno can process.
  const builtIns = builtinModules.reduce(
    (acc, name) => ({
      ...acc,
      [name]: `node:${name}`,
    }),
    {} as Record<string, string>,
  )

  // Creates an object that is compatible with the `imports` block of an import
  // map, mapping specifiers to the paths of their bundled files on disk. Each
  // specifier gets two entries in the import map, one with the `npm:` prefix
  // and one without, such that both options are supported.
  const newImportMap = {
    baseURL: pathToFileURL(temporaryDirectory.path),
    imports: ops.reduce((acc, op) => {
      const url = pathToFileURL(op.filePath).toString()

      return {
        ...acc,
        [op.specifier]: url,
      }
    }, builtIns),
  }

  const cleanup = async () => {
    // If a custom temporary directory was specified, we leave the cleanup job
    // up to the caller.
    if (directory) {
      return
    }

    try {
      await fs.rm(temporaryDirectory.path, { force: true, recursive: true })
    } catch {
      // no-op
    }
  }

  return {
    cleanup,
    directory: temporaryDirectory.path,
    importMap: newImportMap,
  }
}
