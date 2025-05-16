import { cwd, version as nodejsVersion } from 'process'

import { locatePath } from 'locate-path'
import { PackageJson, readPackageUp } from 'read-package-up'

interface PackageJsonInfo {
  packageJson?: PackageJson
  packageJsonPath?: string
}

export type PathExists = (path: string) => Promise<boolean>

export interface Context extends PackageJsonInfo {
  pathExists: PathExists
  nodeVersion: string
}

export const getPackageJson = async (projectDir: string): Promise<PackageJsonInfo> => {
  try {
    const result = await readPackageUp({ cwd: projectDir, normalize: false })
    if (result === undefined) {
      return {}
    }

    const { packageJson, path: packageJsonPath } = result

    return { packageJson, packageJsonPath }
  } catch {
    return {}
  }
}

export const getContext = async (projectDir: string = cwd(), nodeVersion: string = nodejsVersion): Promise<Context> => {
  const { packageJson, packageJsonPath = projectDir } = await getPackageJson(projectDir)

  return {
    pathExists: async (path) => (await locatePath([path], { type: 'file', cwd: projectDir })) !== undefined,
    packageJson,
    packageJsonPath,
    nodeVersion,
  }
}
