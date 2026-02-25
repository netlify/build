import { promises as fs } from 'fs'
import { builtinModules } from 'module'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

import { resolve, ParsedImportMap } from '@import-maps/resolve'
import { build } from 'esbuild'
import { up as findUp } from 'empathic/find'
import { parseImports } from 'parse-imports'
import tmp from 'tmp-promise'

import { ImportMap } from './import_map.js'
import { Logger } from './logger.js'
import { pathsBetween } from './utils/fs.js'
import { TYPESCRIPT_EXTENSIONS } from './utils/typescript.js'

const slugifyFileName = (specifier: string) => {
  return specifier.replace(/\//g, '_')
}

const slugifyPackageName = (specifier: string) => {
  if (!specifier.startsWith('@')) return specifier
  const [scope, pkg] = specifier.split('/')
  return `${scope.replace('@', '')}__${pkg}`
}

/**
 * Returns the name of the `@types/` package used by a given specifier. Most of
 * the times this is just the specifier itself, but scoped packages suffer a
 * transformation (e.g. `@netlify/functions` -> `@types/netlify__functions`).
 * https://github.com/DefinitelyTyped/DefinitelyTyped#what-about-scoped-packages
 */
const getTypesPackageName = (specifier: string) => path.join('@types', slugifyPackageName(specifier))

/**
 * Finds corresponding DefinitelyTyped packages (`@types/...`) and returns path to declaration file.
 */
const getTypePathFromTypesPackage = async (
  packageName: string,
  packageJsonPath: string,
): Promise<string | undefined> => {
  const typesPackagePath = findUp(`node_modules/${getTypesPackageName(packageName)}/package.json`, {
    cwd: packageJsonPath,
  })
  if (!typesPackagePath) {
    return undefined
  }

  const { types, typings } = JSON.parse(await fs.readFile(typesPackagePath, 'utf8'))
  const declarationPath = types ?? typings
  if (typeof declarationPath === 'string') {
    return path.join(typesPackagePath, '..', declarationPath)
  }

  return undefined
}

/**
 * Starting from a `package.json` file, this tries detecting a TypeScript declaration file.
 * It first looks at the `types` and `typings` fields in `package.json`.
 * If it doesn't find them, it falls back to DefinitelyTyped packages (`@types/...`).
 */
const getTypesPath = async (packageJsonPath: string): Promise<string | undefined> => {
  const { name, types, typings } = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'))
  // this only looks at `.types` and `.typings` fields. there might also be data in `exports -> . -> types -> import/default`.
  // we're ignoring that for now.
  const declarationPath = types ?? typings
  if (typeof declarationPath === 'string') {
    return path.join(packageJsonPath, '..', declarationPath)
  }

  return await getTypePathFromTypesPackage(name, packageJsonPath)
}

function packageName(specifier: string) {
  if (!specifier.startsWith('@')) return specifier.split('/')[0]
  const [scope, pkg] = specifier.split('/')
  return `${scope}/${pkg}`
}

const safelyDetectTypes = async (pkg: string, basePath: string): Promise<string | undefined> => {
  try {
    const json = findUp(`node_modules/${packageName(pkg)}/package.json`, {
      cwd: basePath,
    })
    if (json) {
      return await getTypesPath(json)
    }
  } catch {
    return undefined
  }
}

// Workaround for https://github.com/evanw/esbuild/issues/1921.
const banner = {
  js: `
  import __nfyProcess from "node:process";
  import {setImmediate as __nfySetImmediate, clearImmediate as __nfyClearImmediate} from "node:timers";
  import {Buffer as __nfyBuffer} from "node:buffer";
  import {createRequire as ___nfyCreateRequire} from "node:module";
  import {fileURLToPath as ___nfyFileURLToPath} from "node:url";
  import {dirname as ___nfyPathDirname} from "node:path";
  let __filename=___nfyFileURLToPath(import.meta.url);
  let __dirname=___nfyPathDirname(___nfyFileURLToPath(import.meta.url));
  let require=___nfyCreateRequire(import.meta.url);
  globalThis.process = __nfyProcess;
  globalThis.setImmediate = __nfySetImmediate;
  globalThis.clearImmediate = __nfyClearImmediate;
  globalThis.Buffer = __nfyBuffer;
  `,
}

interface GetNPMSpecifiersOptions {
  basePath: string
  functions: string[]
  importMap: ParsedImportMap
  environment: 'production' | 'development'
  rootPath: string
}

async function compileTypeScript(file: string): Promise<string> {
  const compiled = await build({
    bundle: false,
    entryPoints: [file],
    logLevel: 'silent',
    platform: 'node',
    write: false,
  })

  return compiled.outputFiles[0].text
}

async function parseImportsForFile(file: string, rootPath: string) {
  const source = TYPESCRIPT_EXTENSIONS.has(path.extname(file))
    ? await compileTypeScript(file)
    : await fs.readFile(file, 'utf-8')

  return await parseImports(source, {
    resolveFrom: rootPath,
  })
}

/**
 * Parses a set of functions and returns a list of specifiers that correspond
 * to npm modules.
 */
const getNPMSpecifiers = async (
  { basePath, functions, importMap, environment, rootPath }: GetNPMSpecifiersOptions,
  alreadySeenPaths = new Set<string>(),
) => {
  const baseURL = pathToFileURL(basePath)
  const npmSpecifiers: { specifier: string; types?: string }[] = []
  for (const func of functions) {
    const imports = await parseImportsForFile(func, rootPath)

    for (const i of imports) {
      // The non-null assertion is required because typescript can not infer that `moduleSpecifier.value` can be narrowed to a string.
      // The narrowing is possible because `moduleSpecifier.value` will always be a string when `moduleSpecifier.isConstant` is true.
      const specifier = i.moduleSpecifier.isConstant ? i.moduleSpecifier.value! : i.moduleSpecifier.code
      switch (i.moduleSpecifier.type) {
        case 'absolute': {
          if (alreadySeenPaths.has(specifier)) {
            break
          }
          alreadySeenPaths.add(specifier)
          npmSpecifiers.push(
            ...(await getNPMSpecifiers(
              { basePath, functions: [specifier], importMap, environment, rootPath },
              alreadySeenPaths,
            )),
          )
          break
        }
        case 'relative': {
          const filePath = path.join(path.dirname(func), specifier)
          if (alreadySeenPaths.has(filePath)) {
            break
          }
          alreadySeenPaths.add(filePath)
          npmSpecifiers.push(
            ...(await getNPMSpecifiers(
              { basePath, functions: [filePath], importMap, environment, rootPath },
              alreadySeenPaths,
            )),
          )
          break
        }
        case 'package': {
          // node: prefixed imports are detected as packages instead of as builtins
          // we don't want to try and bundle builtins so we ignore node: prefixed imports
          if (specifier.startsWith('node:')) {
            break
          }

          const { matched, resolvedImport } = resolve(specifier, importMap, baseURL)
          if (matched) {
            if (resolvedImport?.protocol === 'file:') {
              const newSpecifier = fileURLToPath(resolvedImport).replace(/\\/g, '/')
              if (alreadySeenPaths.has(newSpecifier)) {
                break
              }
              alreadySeenPaths.add(newSpecifier)
              npmSpecifiers.push(
                ...(await getNPMSpecifiers(
                  { basePath, functions: [newSpecifier], importMap, environment, rootPath },
                  alreadySeenPaths,
                )),
              )
            }
          } else if (!resolvedImport?.protocol?.startsWith('http')) {
            const t = await safelyDetectTypes(specifier, basePath)
            npmSpecifiers.push({
              specifier: specifier,
              types: t,
            })
          }
          break
        }
        case 'builtin':
        case 'invalid':
        case 'unknown': {
          // We don't bundle these types of modules
          break
        }
      }
    }
  }

  return npmSpecifiers
}

interface VendorNPMSpecifiersOptions {
  basePath: string
  directory?: string
  functions: string[]
  importMap: ImportMap
  logger: Logger
  environment: 'production' | 'development'
  rootPath?: string
}

export const vendorNPMSpecifiers = async ({
  basePath,
  directory,
  functions,
  importMap,
  environment,
  rootPath = basePath,
}: VendorNPMSpecifiersOptions) => {
  // The directories that esbuild will use when resolving Node modules. We must
  // set these manually because esbuild will be operating from a temporary
  // directory that will not live inside the project root, so the normal
  // resolution logic won't work.
  const nodePaths = pathsBetween(basePath, rootPath).map((directory) => path.join(directory, 'node_modules'))

  // We need to create some files on disk, which we don't want to write to the
  // project directory. If a custom directory has been specified, we use it.
  // Otherwise, create a random temporary directory.
  const temporaryDirectory = directory ? { path: directory } : await tmp.dir()

  const npmSpecifiers = await getNPMSpecifiers({
    basePath,
    functions,
    importMap: importMap.getContentsWithURLObjects(),
    environment,
    rootPath,
  })

  // To bundle an entire module and all its dependencies, create a entrypoint file
  // where we re-export everything from that specifier. We do this for every
  // specifier, and each of these files will become entry points to esbuild.
  const ops = await Promise.all(
    npmSpecifiers.map(async ({ specifier, types }) => {
      const code = `import * as mod from "${specifier}";\nexport default mod.default;\nexport * from "${specifier}";`
      const filePath = path.join(temporaryDirectory.path, `bundled-${slugifyFileName(specifier)}.js`)

      await fs.writeFile(filePath, code)

      return { filePath, specifier, types }
    }),
  )

  const outputFiles: string[] = []

  if (ops.length !== 0) {
    const entryPoints = ops.map(({ filePath }) => filePath)
    // Bundle each of the entrypoints we created. We'll end up with a compiled
    // version of each, plus any chunks of shared code
    // between them (such that a common module isn't bundled twice).
    const { outputFiles: outputFilesFromEsBuild } = await build({
      allowOverwrite: true,
      banner,
      bundle: true,
      entryPoints,
      format: 'esm',
      mainFields: ['module', 'browser', 'main'],
      logLevel: 'error',
      nodePaths,
      outdir: temporaryDirectory.path,
      platform: 'node',
      splitting: true,
      target: 'es2020',
      write: false,
      define:
        environment === 'production'
          ? {
              'process.env.NODE_ENV': '"production"',
            }
          : undefined,
    })

    outputFiles.push(...outputFilesFromEsBuild.map((file) => file.path))

    await Promise.all(
      outputFilesFromEsBuild.map(async (file) => {
        const types = ops.find((op) => path.basename(file.path) === path.basename(op.filePath))?.types
        let content = file.text
        if (types) {
          content = `/// <reference types="${path.relative(path.dirname(file.path), types)}" />\n${content}`
        }
        await fs.writeFile(file.path, content)
      }),
    )
  }

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
    outputFiles,
  }
}
