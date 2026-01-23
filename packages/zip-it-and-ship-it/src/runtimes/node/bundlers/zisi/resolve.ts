import { findUp } from 'find-up'
import { ResolverFactory } from 'oxc-resolver'
import { pathExists } from 'path-exists'

const BACKSLASH_REGEXP = /\\/g

// Create a resolver that preserves symlinks (symlinks: false means don't resolve symlinks to their real paths)
const preserveSymlinksResolver = new ResolverFactory({
  symlinks: false,
  mainFields: ['main'],
  conditionNames: ['node', 'require'],
})

// Create a resolver that follows symlinks (default behavior)
const followSymlinksResolver = new ResolverFactory({
  symlinks: true,
  mainFields: ['main'],
  conditionNames: ['node', 'require'],
})

// Find the path to a module's `package.json`
// We need to use a resolver that preserves symlinks:
//  - this is important because if a file does a `require('./symlink')`, we
//    need to bundle the symlink and its target, not only the target
//  - `path.resolve()` cannot be used for relative|absolute file paths
//    because it does not resolve omitted file extension,
//    e.g. `require('./file')` instead of `require('./file.js')`
//  - the CLI flag `--preserve-symlinks` can be used with Node.js, but it
//    cannot be set runtime
export const resolvePackage = async function (moduleName: string, baseDirs: string[]): Promise<string> {
  try {
    return await resolvePathPreserveSymlinks(`${moduleName}/package.json`, baseDirs)
  } catch {
    try {
      return await resolvePathFollowSymlinks(`${moduleName}/package.json`, baseDirs)
    } catch (error) {
      return await resolvePackageFallback(moduleName, baseDirs, error as Error)
    }
  }
}

const resolvePathPreserveSymlinksForDir = async function (path: string, basedir: string): Promise<string> {
  const result = await preserveSymlinksResolver.async(basedir, path)

  if (result.error || !result.path) {
    const error = new Error(result.error ?? `Cannot find module '${path}' from '${basedir}'`)
    ;(error as NodeJS.ErrnoException).code = 'MODULE_NOT_FOUND'
    throw error
  }

  return result.path
}

// We return the first resolved location or the first error if all failed
export const resolvePathPreserveSymlinks = async function (path: string, baseDirs: string[]): Promise<string> {
  let firstError: Error | undefined

  for (const basedir of baseDirs) {
    try {
      return await resolvePathPreserveSymlinksForDir(path, basedir)
    } catch (error) {
      firstError = firstError || (error as Error)
    }
  }

  throw firstError!
}

const resolvePathFollowSymlinksForDir = async function (path: string, basedir: string): Promise<string> {
  const result = await followSymlinksResolver.async(basedir, path)

  if (result.error || !result.path) {
    const error = new Error(result.error ?? `Cannot find module '${path}' from '${basedir}'`)
    ;(error as NodeJS.ErrnoException).code = 'MODULE_NOT_FOUND'
    throw error
  }

  return result.path
}

const resolvePathFollowSymlinks = async function (path: string, baseDirs: string[]): Promise<string> {
  let firstError: Error | undefined

  for (const basedir of baseDirs) {
    try {
      return await resolvePathFollowSymlinksForDir(path, basedir)
    } catch (error) {
      firstError = firstError || (error as Error)
    }
  }

  throw firstError!
}

// `require.resolve()` on a module's specific file (like `package.json`)
// can be forbidden by the package author by using an `exports` field in
// their `package.json`. We need this fallback.
// It looks for the first directory up from a package's `main` file that:
//   - is named like the package
//   - has a `package.json`
// Theoretically, this might not the root `package.json`, but this is very
// unlikely, and we don't have any better alternative.
const resolvePackageFallback = async function (moduleName: string, baseDirs: string[], error: Error) {
  const mainFilePath = await resolvePathFollowSymlinks(moduleName, baseDirs)
  const packagePath = await findUp(isPackageDir.bind(null, moduleName), { cwd: mainFilePath, type: 'directory' })

  if (packagePath === undefined) {
    throw error
  }

  return packagePath
}

const isPackageDir = async function (moduleName: string, dir: string) {
  // Need to use `endsWith()` to take into account `@scope/package`.
  // Backslashes need to be converted for Windows.
  if (!dir.replace(BACKSLASH_REGEXP, '/').endsWith(moduleName) || !(await pathExists(`${dir}/package.json`))) {
    return
  }

  return dir
}
