import { promises as fs } from 'fs'
import { builtinModules } from 'module'
import path from 'path'
import { pathToFileURL } from 'url'

import { build, Plugin } from 'esbuild'
import tmp from 'tmp-promise'

import { npmPrefix } from '../shared/consts.js'

// esbuild plugin that will traverse the code and look for imports of external
// dependencies (i.e. Node modules). It stores the specifiers found in the Set
// provided.
export const getDependencyTrackerPlugin = (specifiers: Set<string>): Plugin => ({
  name: 'dependency-tracker',
  setup(build) {
    build.onResolve({ filter: /^(.*)$/ }, (args) => {
      if (args.kind !== 'import-statement') {
        return
      }

      // If the specifier has the `npm:` prefix, strip it and use the rest of
      // the specifier to resolve the module.
      if (args.path.startsWith(npmPrefix)) {
        const canonicalPath = args.path.slice(npmPrefix.length)

        return build.resolve(canonicalPath, {
          kind: args.kind,
          resolveDir: args.resolveDir,
        })
      }

      const isLocalImport = args.path.startsWith(path.sep) || args.path.startsWith('.')

      if (isLocalImport) {
        return
      }

      const isRemoteURLImport = args.path.startsWith('https://') || args.path.startsWith('http://')

      if (!isRemoteURLImport) {
        specifiers.add(args.path)
      }

      // At this point we know we're not dealing with a local import, so we're
      // about to leave the boundaries of user code. We mark the specifier as
      // external, because we're not interested in traversing the entire module
      // tree — i.e. if user code imports module `foo` and that imports `bar`,
      // we only want to add `foo` to the list of specifiers, since the whole
      // module — including its dependencies like `bar` — will be bundled.
      return { external: true }
    })
  },
})

export const vendorNPMSpecifiers = async (basePath: string, functions: string[], directory?: string) => {
  const specifiers = new Set<string>()

  // The directories that esbuild will use when resolving Node modules. We must
  // set these manually because esbuild will be operating from a temporary
  // directory that will not live inside the project root, so the normal
  // resolution logic won't work.
  const nodePaths = [path.join(basePath, 'node_modules')]

  // Do a first pass at bundling to gather a list of specifiers that should be
  // loaded as npm dependencies, because they either use the `npm:` prefix or
  // they are bare specifiers. We'll collect them in `specifiers`.
  await build({
    bundle: true,
    entryPoints: functions,
    nodePaths,
    platform: 'node',
    plugins: [getDependencyTrackerPlugin(specifiers)],
    write: false,
  })

  // If we found no specifiers, there's nothing left to do here.
  if (specifiers.size === 0) {
    return
  }

  // We need to create some files on disk, which we don't want to write to the
  // project directory. If a custom directory has been specified, which happens
  // only in tests, we use it. Otherwise, create a random temporary directory.
  const temporaryDirectory = directory ? { path: directory } : await tmp.dir()

  // To bundle an entire module and all its dependencies, we create a stub file
  // where we re-export everything from that specifier. We do this for every
  // specifier, and each of these files will be the entry points to esbuild.
  const ops = await Promise.all(
    [...specifiers].map(async (specifier, index) => {
      const code = `export { default } from "${specifier}"; export * from "${specifier}";`
      const filePath = path.join(temporaryDirectory.path, `stub-${index}.js`)

      await fs.writeFile(filePath, code)

      return { filePath, specifier }
    }),
  )
  const entryPoints = ops.map(({ filePath }) => filePath)

  // Bundle each of the stub files we've created. We'll end up with a compiled
  // version of each of the stub files, plus any chunks of shared code between
  // stubs (such that a common module isn't bundled twice).
  await build({
    allowOverwrite: true,
    bundle: true,
    entryPoints,
    format: 'esm',
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
  const imports = ops.reduce((acc, op) => {
    const url = pathToFileURL(op.filePath).toString()

    return {
      ...acc,
      [op.specifier]: url,
      [npmPrefix + op.specifier]: url,
    }
  }, builtIns)
  const importMap = {
    baseURL: pathToFileURL(temporaryDirectory.path),
    imports,
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
    importMap,
  }
}
