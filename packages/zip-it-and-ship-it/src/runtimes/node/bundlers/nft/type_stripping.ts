import { dirname, extname, resolve, sep } from 'path'

import { init, parse } from 'es-module-lexer'
import { transform } from 'esbuild'

import { FunctionBundlingUserError } from '../../../../utils/error.js'
import { getPathWithExtension } from '../../../../utils/fs.js'
import { RUNTIME } from '../../../runtime.js'
import { tsExtensions } from '../../utils/module_format.js'
import { NODE_BUNDLER } from '../types.js'

// Maps each TypeScript extension to the resulting JavaScript extension.
const JS_EXTENSIONS: Partial<Record<string, string>> = { '.ts': '.js', '.mts': '.mjs', '.cts': '.cjs' }

// Matches a string that ends in `.ts`, `.mts` or `.cts`, like `'./file.ts'`.
const TS_SPECIFIER = /\.[cm]?ts['"]/

/**
 * Returns the JavaScript path for a TypeScript file.
 */
const getStrippedPath = (path: string) => {
  const extension = JS_EXTENSIONS[extname(path)]

  if (extension === undefined) {
    return path
  }

  return getPathWithExtension(path, extension)
}

/**
 * Removes the types from a TypeScript file.
 */
const stripTypes = async ({ name, path, source }: { name: string; path: string; source: string }) => {
  try {
    const { code } = await transform(source, {
      loader: 'ts',
      sourcefile: path,
      // Keep every import that isn't marked with `type`, like Node.js does.
      tsconfigRaw: { compilerOptions: { verbatimModuleSyntax: true } },
    })

    return code
  } catch (error) {
    throw FunctionBundlingUserError.addCustomErrorInfo(error as Error, {
      functionName: name,
      runtime: RUNTIME.JAVASCRIPT,
      bundler: NODE_BUNDLER.NFT,
    })
  }
}

export interface StrippedSource {
  // TypeScript files this file imports by a relative path.
  importedTypeScript: string[]

  // What we put in the archive for this file.
  source: string
}

/**
 * Points relative imports of TypeScript files at the JavaScript files they
 * become. Returns the new source and the TypeScript files it imports.
 *
 * For example, `import { greet } from './greeting.ts'` becomes
 * `import { greet } from './greeting.js'`.
 */
const renameTypeScriptImports = async (path: string, source: string): Promise<StrippedSource> => {
  const importedTypeScript: string[] = []

  // Skip parsing files that don't mention a TypeScript file.
  if (!TS_SPECIFIER.test(source)) {
    return { importedTypeScript, source }
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
    importedTypeScript.push(resolve(dirname(path), specifier))
  }

  return { importedTypeScript, source: renamedSource + source.slice(position) }
}

/**
 * Returns the source NFT should trace for an unbundled file and, if it's
 * different from the file, the source the archive should get.
 */
export const readSource = async ({
  name,
  path,
  source,
}: {
  name: string
  path: string
  source: string
}): Promise<{ rewrite?: StrippedSource; tracedSource: string }> => {
  const isTypeScript = tsExtensions.has(extname(path))

  // NFT can only parse JavaScript.
  const tracedSource = isTypeScript ? await stripTypes({ name, path, source }) : source

  // Node.js doesn't load TypeScript from `node_modules`, so we ship those files
  // as they are.
  if (path.split(sep).includes('node_modules')) {
    return { tracedSource }
  }

  // NFT still gets the original import paths, since those are the files on disk.
  const rewrite = await renameTypeScriptImports(path, tracedSource)

  // A JavaScript file that doesn't import any TypeScript ships unchanged.
  if (!isTypeScript && rewrite.importedTypeScript.length === 0) {
    return { tracedSource }
  }

  return { rewrite, tracedSource }
}

/**
 * Returns the aliases and rewrites that turn TypeScript files into JavaScript
 * files in the archive.
 */
export const getStrippedFiles = ({
  mainFile,
  name,
  possibleRewrites,
  tracedPaths,
}: {
  mainFile: string
  name: string
  possibleRewrites: Map<string, StrippedSource>
  tracedPaths: string[]
}) => {
  const aliases = new Map<string, string>()
  const rewrites = new Map<string, string>()
  const traced = new Set(tracedPaths)
  const imported = new Set([...possibleRewrites.values()].flatMap(({ importedTypeScript }) => importedTypeScript))

  for (const [path, { importedTypeScript, source }] of possibleRewrites) {
    // We only rename files whose imports we update. A file that's only reached
    // through a package's entry point keeps its name, since its `package.json`
    // points to it.
    const shouldRename = tsExtensions.has(extname(path)) && (path === mainFile || imported.has(path))

    if (shouldRename) {
      const strippedPath = getStrippedPath(path)

      if (traced.has(strippedPath)) {
        throw new FunctionBundlingUserError(
          `Cannot strip the types from ${path}, because ${strippedPath} is also included.`,
          { functionName: name, runtime: RUNTIME.JAVASCRIPT, bundler: NODE_BUNDLER.NFT },
        )
      }

      aliases.set(path, strippedPath)
    }

    // A file that keeps its name still needs the new source if its imports changed.
    if (shouldRename || importedTypeScript.length !== 0) {
      rewrites.set(path, source)
    }
  }

  return { aliases, mainFile: aliases.get(mainFile) ?? mainFile, rewrites }
}
