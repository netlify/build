import { resolve } from 'path'
import { cwd } from 'process'

import { readPackage, PackageJson } from 'read-pkg'

/**
 * Reads a package.json up the tree starting at the provided directory
 * @param cwd The current working directory where it tries to find the package.json
 * @returns A parsed object of the package.json
 */
const getPackageJson = async (cwd: string): Promise<PackageJson> => {
  try {
    return await readPackage({ cwd, normalize: false })
  } catch {
    return {}
  }
}

export type ContextOptions = {
  projectDir?: string
  rootDir?: string
}

export type Context = {
  projectDir: string
  rootDir?: string
  rootPackageJson: PackageJson
}

export const getContext = async (config: ContextOptions = {}): Promise<Context> => {
  const { projectDir = cwd(), rootDir = '' } = config
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
