import { dirname, extname, resolve, sep } from 'path'

import { init, parse } from 'es-module-lexer'
import { build } from 'esbuild'

import { FunctionBundlingUserError } from '../../../../utils/error.js'
import { RUNTIME } from '../../../runtime.js'
import { tsExtensions } from '../../utils/module_format.js'
import { getBundlerTarget } from '../esbuild/bundler_target.js'
import { NODE_BUNDLER } from '../types.js'

// Maps each TypeScript extension to the resulting JavaScript extension.
const JS_EXTENSIONS: Partial<Record<string, string>> = { '.ts': '.js', '.mts': '.mjs', '.cts': '.cjs' }

// Matches a string that ends in `.js`, `.ts`, `.mts` or `.cts`, like `'./file.ts'`.
const LOCAL_SPECIFIER = /\.(js|[cm]?ts)['"]/

/**
 * Returns the JavaScript path for a TypeScript file.
 */
const getStrippedPath = (path: string) => {
  const extension = extname(path)
  const jsExtension = JS_EXTENSIONS[extension]

  if (jsExtension === undefined) {
    return path
  }

  // Import specifiers must keep their forward slashes, so we can't use
  // `path.format` on Windows.
  return path.slice(0, -extension.length) + jsExtension
}

/**
 * Removes the types from a TypeScript file and compiles the syntax that the
 * target Node.js version doesn't support, using the project's `tsconfig.json`.
 */
const stripTypes = async ({ name, nodeVersion, path }: { name: string; nodeVersion?: string; path: string }) => {
  try {
    const { outputFiles } = await build({
      bundle: false,
      entryPoints: [path],
      logLevel: 'silent',
      platform: 'node',
      target: [getBundlerTarget(nodeVersion)],
      write: false,
    })

    return outputFiles[0].text
  } catch (error) {
    throw FunctionBundlingUserError.addCustomErrorInfo(error as Error, {
      functionName: name,
      runtime: RUNTIME.JAVASCRIPT,
      bundler: NODE_BUNDLER.NFT,
    })
  }
}

export interface StrippedSource {
  // Files this file imports by a relative path that ends in `.js`.
  importedJavaScript: string[]

  // TypeScript files this file imports by a relative path.
  importedTypeScript: string[]

  // What we put in the archive for this file.
  source: string
}

/**
 * Points relative imports of TypeScript files at the JavaScript files they
 * become. Returns the new source and the files it imports.
 *
 * For example, `import { greet } from './greeting.ts'` becomes
 * `import { greet } from './greeting.js'`.
 */
const renameTypeScriptImports = async (path: string, source: string): Promise<StrippedSource> => {
  const importedJavaScript: string[] = []
  const importedTypeScript: string[] = []

  // Skip parsing files that don't mention a JavaScript or TypeScript file.
  if (!LOCAL_SPECIFIER.test(source)) {
    return { importedJavaScript, importedTypeScript, source }
  }

  await init

  const [imports] = parse(source)
  let renamedSource = ''
  let position = 0

  for (const { d: dynamicStart, e: end, n: specifier, s: start } of imports) {
    // Skip package imports, and dynamic imports with a computed path.
    if (!specifier?.startsWith('.')) {
      continue
    }

    const importedPath = resolve(dirname(path), specifier)

    if (extname(specifier) === '.js') {
      importedJavaScript.push(importedPath)

      continue
    }

    const renamed = getStrippedPath(specifier)

    if (renamed === specifier) {
      continue
    }

    // The range of a dynamic import includes the quotes around the specifier,
    // so we leave them out.
    const isDynamic = dynamicStart > -1
    const specifierStart = isDynamic ? start + 1 : start
    const specifierEnd = isDynamic ? end - 1 : end

    renamedSource += source.slice(position, specifierStart) + renamed
    position = specifierEnd
    importedTypeScript.push(importedPath)
  }

  return { importedJavaScript, importedTypeScript, source: renamedSource + source.slice(position) }
}

/**
 * Returns the source NFT should trace for an unbundled file and, if it's
 * different from the file, the source the archive should get.
 */
export const readSource = async ({
  name,
  nodeVersion,
  path,
  source,
}: {
  name: string
  nodeVersion?: string
  path: string
  source: string
}): Promise<{ rewrite?: StrippedSource; tracedSource: string }> => {
  const isTypeScript = tsExtensions.has(extname(path))

  // NFT can only parse JavaScript.
  const tracedSource = isTypeScript ? await stripTypes({ name, nodeVersion, path }) : source

  // Node.js doesn't load TypeScript from `node_modules`, so we ship those files
  // as they are.
  if (path.split(sep).includes('node_modules')) {
    return { tracedSource }
  }

  // NFT still gets the original import paths, since those are the files on disk.
  const rewrite = await renameTypeScriptImports(path, tracedSource)

  // A JavaScript file that doesn't import any local files ships unchanged.
  if (!isTypeScript && rewrite.importedJavaScript.length === 0 && rewrite.importedTypeScript.length === 0) {
    return { tracedSource }
  }

  return { rewrite, tracedSource }
}

/**
 * Returns the aliases and rewrites that turn TypeScript files into JavaScript
 * files in the archive.
 */
export const getStrippedFiles = ({
  includedPaths,
  mainFile,
  name,
  possibleRewrites,
  tracedPaths,
}: {
  includedPaths: string[]
  mainFile: string
  name: string
  possibleRewrites: Map<string, StrippedSource>
  tracedPaths: string[]
}) => {
  const aliases = new Map<string, string>()
  const rewrites = new Map<string, string>()
  const archived = new Set([...tracedPaths, ...includedPaths])
  const imported = new Set<string>()

  for (const { importedJavaScript, importedTypeScript } of possibleRewrites.values()) {
    importedTypeScript.forEach((path) => imported.add(path))

    // NFT traces `./file.js` to `./file.ts` when only the TypeScript file exists.
    for (const path of importedJavaScript) {
      if (!archived.has(path)) {
        imported.add(`${path.slice(0, -'.js'.length)}.ts`)
      }
    }
  }

  for (const [path, { importedTypeScript, source }] of possibleRewrites) {
    const isTypeScript = tsExtensions.has(extname(path))

    // We only rename TypeScript files that other files import by a relative
    // path. A file that's only reached through a package's entry point keeps
    // its name, since its `package.json` points to it.
    const shouldRename = isTypeScript && (path === mainFile || imported.has(path))

    if (shouldRename) {
      const strippedPath = getStrippedPath(path)

      if (archived.has(strippedPath)) {
        throw new FunctionBundlingUserError(
          `Cannot strip the types from ${path}, because ${strippedPath} is also included.`,
          { functionName: name, runtime: RUNTIME.JAVASCRIPT, bundler: NODE_BUNDLER.NFT },
        )
      }

      aliases.set(path, strippedPath)
    }

    // A TypeScript file that keeps its name still ships without its types.
    if (isTypeScript || importedTypeScript.length !== 0) {
      rewrites.set(path, source)
    }
  }

  return { aliases, mainFile: aliases.get(mainFile) ?? mainFile, rewrites }
}
