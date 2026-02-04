import { dirname } from 'path'

import { type Options, type PackageJson, readPackageUp } from 'read-package-up'

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
    const readResult = await readPackageUp({
      cwd,
      ...Object.assign({ normalize: true }, options),
    })

    if (readResult) {
      result.packageJson = readResult.packageJson
      result.packageDir = dirname(readResult.path)
    }
  } catch {
    // continue regardless error
  }
  return result
}

export type { PackageJson }
