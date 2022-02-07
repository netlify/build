import { cwd, version } from 'process'

import isPlainObj from 'is-plain-obj'
import locatePath from 'locate-path'
import { readPackageUp } from 'read-pkg-up'

const getPackageJson = async (projectDir) => {
  try {
    const result = await readPackageUp({ cwd: projectDir, normalize: false })
    if (result === undefined) {
      return {}
    }

    const { packageJson, path: packageJsonPath } = result

    if (!isPlainObj(packageJson)) {
      return { packageJsonPath }
    }

    return { packageJson, packageJsonPath }
  } catch {
    return {}
  }
}

export const getContext = async ({ projectDir = cwd(), nodeVersion = version } = {}) => {
  const { packageJson, packageJsonPath = projectDir } = await getPackageJson(projectDir)
  return {
    pathExists: async (path) => (await locatePath([path], { type: 'file', cwd: projectDir })) !== undefined,
    packageJson,
    packageJsonPath,
    nodeVersion,
  }
}
