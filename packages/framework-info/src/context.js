import { cwd, version as nodejsVersion } from 'process'

import { locatePath } from 'locate-path'
import { readPackageUp } from 'read-pkg-up'

/*
interface PackageJsonInfo {
  packageJson?: PackageJson
  packageJsonPath?: string
}

interface Context extends PackageJsonInfo {
  pathExists: (path: string) => Promise<boolean>
  nodeVersion: string
}
*/

export const getPackageJson = async (projectDir /*: string*/) /*: Promise<PackageJsonInfo>*/ => {
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

export const getContext = async (
  projectDir /*: string*/ = cwd(),
  nodeVersion /*: string*/ = nodejsVersion,
) /*: Promise<Context>*/ => {
  const { packageJson, packageJsonPath = projectDir } = await getPackageJson(projectDir)

  return {
    pathExists: async (path) => (await locatePath([path], { type: 'file', cwd: projectDir })) !== undefined,
    packageJson,
    packageJsonPath,
    nodeVersion,
  }
}
