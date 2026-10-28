import { readFile } from 'fs/promises'
import { isAbsolute, join, resolve } from 'path'

import { resolveModulePath } from 'exsolve'
import { findUp } from 'find-up'

// Find the path to a module's `package.json` by walking up `node_modules`
// directories from each base directory. Unlike module resolution, this is not
// subject to the package's `exports` field, which can forbid resolving
// `package.json` directly.
export const resolvePackage = async function (moduleName: string, baseDirs: string[]): Promise<string> {
  const packageJsonPath = join('node_modules', moduleName, 'package.json')

  for (const baseDir of baseDirs) {
    const packagePath = await findUp(packageJsonPath, { cwd: baseDir })

    if (packagePath !== undefined) {
      return packagePath
    }
  }

  const error = new Error(`Cannot find module '${moduleName}'`)
  ;(error as Error & { code: string }).code = 'MODULE_NOT_FOUND'
  throw error
}

// Like `resolvePath()` but does not throw
export const tryResolvePath = async function (
  path: string,
  basedir: string,
): Promise<{ path: string; error?: undefined } | { path?: undefined; error: unknown }> {
  try {
    const resolvedPath = await resolvePath(path, basedir)
    return { path: resolvedPath }
  } catch (error) {
    return { error }
  }
}

// This throws if the package cannot be found.
// Caching is disabled because plugins can be installed or updated between
// resolutions within the same process.
export const resolvePath = async function (path: string, basedir: string): Promise<string> {
  try {
    return resolveModule(path, basedir)
  } catch (error) {
    const mainPath = await getDirectoryMain(path, basedir)

    if (mainPath === undefined) {
      throw error
    }

    return resolveModule(mainPath, basedir)
  }
}

const resolveModule = function (path: string, basedir: string): string {
  return resolveModulePath(path, {
    from: `${basedir}/`,
    conditions: ['node', 'require'],
    extensions: ['.js'],
    suffixes: ['', '/index'],
    cache: false,
  })
}

// This accounts for the `require` behaviour of loading `{dir}/package.json`
// if you resolve a directory, and then loading the specified `main`.
const getDirectoryMain = async function (path: string, basedir: string): Promise<string | undefined> {
  if (!path.startsWith('.') && !isAbsolute(path)) {
    return undefined
  }

  const packageDir = resolve(basedir, path)

  let packageJson: { main?: unknown }
  try {
    packageJson = JSON.parse(await readFile(join(packageDir, 'package.json'), 'utf8')) as { main?: unknown }
  } catch {
    return undefined
  }

  if (typeof packageJson.main !== 'string') {
    return undefined
  }

  return join(packageDir, packageJson.main)
}
