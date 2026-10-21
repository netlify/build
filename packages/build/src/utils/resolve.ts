import { createRequire } from 'module'

// TODO: use `import.resolve()` once it is available without any experimental
// flags
const require = createRequire(import.meta.url)

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

// This throws if the package cannot be found
// eslint-disable-next-line @typescript-eslint/require-await
export const resolvePath = async function (path: string, basedir: string): Promise<string> {
  return require.resolve(path, { paths: [basedir] })
}
