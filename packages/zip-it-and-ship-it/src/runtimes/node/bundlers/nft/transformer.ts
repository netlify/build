import { readFile } from 'fs/promises'
import { dirname, extname, relative, resolve, sep } from 'path'

import { parse, type ParserPlugin } from '@babel/parser'
import {
  isIdentifier,
  isMemberExpression,
  isMetaProperty,
  type Identifier,
  type MemberExpression,
  type Node,
  type Program,
} from '@babel/types'
import { build, BuildOptions, type Loader, type Plugin } from 'esbuild'

import type { FunctionConfig } from '../../../../config.js'
import { FunctionBundlingUserError } from '../../../../utils/error.js'
import { getPathWithExtension } from '../../../../utils/fs.js'
import { RUNTIME } from '../../../runtime.js'
import { CJS_SHIM } from '../../utils/esm_cjs_compat.js'
import { MODULE_FORMAT, MODULE_FILE_EXTENSION, ModuleFormat } from '../../utils/module_format.js'
import { getClosestPackageJson } from '../../utils/package_json.js'
import { getBundlerTarget } from '../esbuild/bundler_target.js'
import { NODE_BUNDLER } from '../types.js'

type Transformer = {
  aliases: Map<string, string>
  bundle?: boolean
  bundledPaths?: string[]
  format: ModuleFormat
  newMainFile?: string
  rewrites: Map<string, string>
}

/**
 * Returns the module format that should be used for a given function file.
 */
const getModuleFormat = async (
  mainFile: string,
  runtimeAPIVersion: number,
  repositoryRoot?: string,
): Promise<ModuleFormat> => {
  const extension = extname(mainFile)

  // TODO: This check should go away. We should always respect the format from
  // the extension. We'll do this at a later stage, after we roll out the V2
  // API with no side-effects on V1 functions.
  if (runtimeAPIVersion === 2) {
    if (extension === MODULE_FILE_EXTENSION.MJS || extension === MODULE_FILE_EXTENSION.MTS) {
      return MODULE_FORMAT.ESM
    }

    if (extension === MODULE_FILE_EXTENSION.CTS || extension === MODULE_FILE_EXTENSION.CTS) {
      return MODULE_FORMAT.COMMONJS
    }
  }

  // At this point, we need to infer the module type from the `type` field in
  // the closest `package.json`.
  try {
    const packageJSON = await getClosestPackageJson(dirname(mainFile), repositoryRoot)

    if (packageJSON?.contents.type === 'module') {
      return MODULE_FORMAT.ESM
    }
  } catch {
    // no-op
  }

  return MODULE_FORMAT.COMMONJS
}

export const getTransformer = async (
  runtimeAPIVersion: number,
  mainFile: string,
  repositoryRoot?: string,
): Promise<Transformer | undefined> => {
  const format = await getModuleFormat(mainFile, runtimeAPIVersion, repositoryRoot)
  const aliases = new Map<string, string>()
  const rewrites = new Map<string, string>()
  const transformer = {
    aliases,
    format,
    rewrites,
  }

  if (runtimeAPIVersion === 2) {
    // For V2 functions, we want to emit a main file with an unambiguous
    // extension (i.e. `.cjs` or `.mjs`), so that the file is loaded with
    // the correct format regardless of what is set in `package.json`.
    const newExtension = format === MODULE_FORMAT.COMMONJS ? MODULE_FILE_EXTENSION.CJS : MODULE_FILE_EXTENSION.MJS
    const newMainFile = getPathWithExtension(mainFile, newExtension)

    return {
      ...transformer,
      bundle: true,
      bundledPaths: [],
      newMainFile,
    }
  }

  return transformer
}

const IMPORT_META_REPLACEMENTS: Record<string, string> = {
  dirname: '___nfyModulePathDirname(___nfyModuleFileURLToPath(___nfyModuleURL))',
  filename: '___nfyModuleFileURLToPath(___nfyModuleURL)',
  url: '___nfyModuleURL',
}

const LOADERS: Record<string, Loader> = {
  '.cts': 'ts',
  '.jsx': 'jsx',
  '.mts': 'ts',
  '.ts': 'ts',
  '.tsx': 'tsx',
}

const isImportMetaPath = (node: Node): node is MemberExpression =>
  isMemberExpression(node) &&
  !node.computed &&
  isMetaProperty(node.object) &&
  node.object.meta.name === 'import' &&
  isIdentifier(node.property) &&
  node.property.name in IMPORT_META_REPLACEMENTS

const findImportMetaPaths = (value: unknown, found: MemberExpression[] = []): MemberExpression[] => {
  if (Array.isArray(value)) {
    value.forEach((item) => findImportMetaPaths(item, found))
  } else if (value !== null && typeof value === 'object' && 'type' in value) {
    if (isImportMetaPath(value as Node)) {
      found.push(value as MemberExpression)
    } else {
      Object.entries(value).forEach(([key, child]) => key !== 'loc' && findImportMetaPaths(child, found))
    }
  }

  return found
}

// Each accepts a decorator form the other rejects: `export @dec class` and
// parameter decorators.
const DECORATOR_PLUGINS: ParserPlugin[] = ['decorators', 'decorators-legacy']

const parseModule = (source: string, path: string): Program | null => {
  const syntaxPlugins: ParserPlugin[] = ['.jsx', '.tsx'].includes(extname(path))
    ? ['typescript', 'jsx']
    : ['typescript']

  for (const decoratorPlugin of DECORATOR_PLUGINS) {
    try {
      return parse(source, { plugins: [...syntaxPlugins, decoratorPlugin], sourceType: 'module' }).program
    } catch {
      // Try the next decorator syntax.
    }
  }

  return null
}

// Returns `source` with each `import.meta` path expression replaced, or null
// when it cannot be parsed.
const replaceImportMetaPaths = (source: string, path: string): string | null => {
  const program = parseModule(source, path)

  if (program === null) {
    return null
  }

  return findImportMetaPaths(program)
    .sort((a, b) => (b.start ?? 0) - (a.start ?? 0))
    .reduce(
      (result, node) =>
        result.slice(0, node.start ?? 0) +
        IMPORT_META_REPLACEMENTS[(node.property as Identifier).name] +
        result.slice(node.end ?? 0),
      source,
    )
}

/**
 * An esbuild plugin that makes `import.meta.url`, `import.meta.dirname` and
 * `import.meta.filename` in each local module bundled into `mainFile` describe
 * that module's own path, as if it still ran from its own file. The archive
 * keeps the source layout, so the module's path relative to `mainFile` holds at
 * runtime.
 */
const getModulePathsPlugin = (mainFile: string): Plugin => ({
  name: 'netlify-module-paths',
  setup(build) {
    build.onLoad({ filter: /\.[cm]?[jt]sx?$/ }, async ({ path }) => {
      if (path === mainFile || path.split(sep).includes('node_modules')) {
        return
      }

      const source = await readFile(path, 'utf-8')

      if (!source.includes('import.meta')) {
        return
      }

      const replaced = replaceImportMetaPaths(source, path)

      if (replaced === null || replaced === source) {
        return
      }

      const relativeURL = relative(dirname(mainFile), path).split(sep).map(encodeURIComponent).join('/')

      // On the module's first line after any hashbang, so the line numbers in
      // stack traces hold. Not `new URL(path, import.meta.url)`: NFT would
      // trace the module's source as an asset of the bundle.
      const hashbang = /^#!.*\n?/.exec(replaced)?.[0] ?? ''
      const prelude =
        'import {fileURLToPath as ___nfyModuleFileURLToPath} from "url";' +
        'import {dirname as ___nfyModulePathDirname} from "path";' +
        `const ___nfyModuleURL=new URL(import.meta.url.slice(0,import.meta.url.lastIndexOf("/")+1)+${JSON.stringify(relativeURL)}).href;`

      return {
        contents: hashbang + prelude + replaced.slice(hashbang.length),
        loader: LOADERS[extname(path)] ?? 'js',
      }
    })
  },
})

interface TransformOptions {
  bundle?: boolean
  config: FunctionConfig
  format?: ModuleFormat
  isServer?: boolean
  name: string
  path: string
}

export const transform = async ({ bundle = false, config, format, isServer, name, path }: TransformOptions) => {
  // The version of ECMAScript to use as the build target. This will determine
  // whether certain features are transpiled down or left untransformed.
  const nodeTarget = getBundlerTarget(config.nodeVersion)
  const bundleOptions: BuildOptions = {
    bundle: false,
  }

  if (bundle) {
    bundleOptions.bundle = true
    bundleOptions.packages = 'external'

    if (format === MODULE_FORMAT.ESM) {
      bundleOptions.banner = { js: CJS_SHIM }

      if (isServer) {
        bundleOptions.plugins = [getModulePathsPlugin(path)]
      }
    }
  }

  try {
    const transpiled = await build({
      ...bundleOptions,
      entryPoints: [path],
      format,
      logLevel: 'error',
      metafile: true,
      platform: 'node',
      sourcemap: Boolean(config.nodeSourcemap),
      target: [nodeTarget],
      write: false,
    })
    const bundledPaths = bundle ? Object.keys(transpiled.metafile.inputs).map((inputPath) => resolve(inputPath)) : []

    return { bundledPaths, transpiled: transpiled.outputFiles[0].text }
  } catch (error) {
    throw FunctionBundlingUserError.addCustomErrorInfo(error, {
      functionName: name,
      runtime: RUNTIME.JAVASCRIPT,
      bundler: NODE_BUNDLER.NFT,
    })
  }
}
