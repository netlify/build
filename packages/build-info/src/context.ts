import { existsSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { cwd } from 'process'

import { findUp } from 'find-up'
import { PackageJson, readPackage } from 'read-pkg'

/**
 * Collects the root package.json if there is one.
 */
const getRootPackageJson = async (projectDir: string, rootDir: string): Promise<PackageJson> => {
  if (existsSync(join(rootDir, 'package.json'))) {
    return await readPackage({ cwd: rootDir, normalize: false })
  }

  const json = await findUp('package.json', { cwd: projectDir, stopAt: rootDir })

  if (json) {
    return await readPackage({ cwd: dirname(json), normalize: false })
  }
  return {}
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
  const rootPackageJson = await getRootPackageJson(absoluteProjectDir, validRootDir || absoluteProjectDir)
  return {
    projectDir: absoluteProjectDir,
    rootDir: validRootDir,
    rootPackageJson,
  }
}
