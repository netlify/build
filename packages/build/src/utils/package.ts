import { dirname } from 'path'

import { Options, PackageJson, readPackageUp } from 'read-pkg-up'

type PackageResult = {
  packageJson: PackageJson
  packageDir?: string
}

/**
 * Retrieve `package.json` from a specific directory
 */
export const getPackageJson = async function (cwd: string, options: Omit<Options, 'cwd'> = {}): Promise<PackageResult> {
  const result: PackageResult = {
    packageJson: {},
  }

  try {
    const { path, packageJson } = await readPackageUp({
      cwd,
      ...Object.assign({ normalize: true }, options),
    })

    result.packageJson = packageJson
    result.packageDir = dirname(path)
  } catch {
    // continue regardless error
  }
  return result
}
