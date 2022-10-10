import { resolve } from 'path'
import { cwd } from 'process'

import { readPackage } from 'read-pkg'

const getPackageJson = async function (dir) {
  try {
    const packageJson = await readPackage({ cwd: dir, normalize: false })
    if (packageJson === undefined) {
      return {}
    }

    return packageJson
  } catch {
    return {}
  }
}

export const getContext = async function ({ projectDir = cwd(), rootDir = '' } = {}) {
  // Get the absolute dirs for both project and root
  // We resolve the projectDir from the rootDir
  const absoluteProjectDir = resolve(rootDir, projectDir)
  // If a relative absolute path is given we rely on cwd
  const absoluteRootDir = rootDir ? resolve(cwd(), rootDir) : undefined

  // We only pass through the root dir if it was provided and is actually different
  // from the project dir
  const validRootDir = absoluteRootDir && absoluteRootDir !== absoluteProjectDir ? absoluteRootDir : undefined

  // If rootDir equals projectDir we'll be getting the projectDir package.json
  // Later on if we also need the projectDir package.json we can check for it
  // and only perform one resolution
  const rootPackageJson = await getPackageJson(rootDir || projectDir)
  return {
    projectDir: absoluteProjectDir,
    rootDir: validRootDir,
    rootPackageJson,
  }
}
