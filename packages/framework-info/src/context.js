const { cwd, version } = require('process')

const isPlainObj = require('is-plain-obj')
const locatePath = require('locate-path')
const readPkgUp = require('read-pkg-up')

const getPackageJson = async (projectDir) => {
  try {
    const result = await readPkgUp({ cwd: projectDir, normalize: false })
    if (result === undefined) {
      return {}
    }

    const { packageJson, path: packageJsonPath } = result

    if (!isPlainObj(packageJson)) {
      return { packageJsonPath }
    }

    return { packageJson, packageJsonPath }
  } catch (error) {
    return {}
  }
}

const getContext = async ({ projectDir = cwd() } = {}) => {
  const { packageJson, packageJsonPath = projectDir } = await getPackageJson(projectDir)
  return {
    pathExists: async (path) => (await locatePath([path], { type: 'file', cwd: projectDir })) !== undefined,
    packageJson,
    packageJsonPath,
    nodeVersion: version,
  }
}

module.exports = { getContext }
