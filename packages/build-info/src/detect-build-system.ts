import { readFileSync } from 'fs'
import path from 'path'

import { findUpSync } from 'find-up'
import { PackageJson } from 'read-pkg'

export type BuildSystem = {
  name: string
  version?: string | undefined
}

export const detectBuildSystems = async (baseDir: string, rootDir?: string): Promise<BuildSystem[]> => {
  const buildTools = Object.keys(BUILD_SYSTEMS)
  const buildSystems = await Promise.all(buildTools.map(async (tool) => await BUILD_SYSTEMS[tool](baseDir, rootDir)))
  return buildSystems.filter((tool) => tool != undefined)
}

const BUILD_SYSTEMS = {
  nx: async (baseDir: string, rootDir?: string): Promise<BuildSystem | undefined> => {
    const nx = ['nx.json']
    const nxConfigPath = lookFor(nx, baseDir, rootDir)

    if (nxConfigPath) {
      const pkgJson = getPkgJson(nxConfigPath)
      const { devDependencies } = pkgJson

      return Promise.resolve({
        name: 'nx',
        version: devDependencies?.nx,
      })
    }
  },

  lerna: async (baseDir: string, rootDir?: string): Promise<BuildSystem | undefined> => {
    const lerna = ['lerna.json']
    const lernaConfigPath = lookFor(lerna, baseDir, rootDir)

    if (lernaConfigPath) {
      const pkgJson = getPkgJson(lernaConfigPath)
      const { devDependencies } = pkgJson

      return Promise.resolve({
        name: 'lerna',
        version: devDependencies?.lerna,
      })
    }
  },

  turbo: async (baseDir: string, rootDir?: string): Promise<BuildSystem | undefined> => {
    const turbo = ['turbo.json']
    const turboConfigPath = lookFor(turbo, baseDir, rootDir)

    if (turboConfigPath) {
      const pkgJson = getPkgJson(turboConfigPath)
      const { devDependencies } = pkgJson

      return Promise.resolve({
        name: 'turbo',
        version: devDependencies?.turbo,
      })
    }
  },

  rush: async (baseDir: string, rootDir?: string): Promise<BuildSystem | undefined> => {
    const rush = ['rush.json']
    const rushConfigPath = lookFor(rush, baseDir, rootDir)

    if (rushConfigPath) {
      const pkgJson = getPkgJson(rushConfigPath)
      const { devDependencies } = pkgJson

      return Promise.resolve({
        name: 'rush',
        version: devDependencies?.rush,
      })
    }
  },

  lage: async (baseDir: string, rootDir?: string): Promise<BuildSystem | undefined> => {
    const lage = ['lage.config.js']
    const lageConfigPath = lookFor(lage, baseDir, rootDir)

    if (lageConfigPath) {
      const pkgJson = getPkgJson(lageConfigPath)
      const { devDependencies } = pkgJson

      return Promise.resolve({
        name: 'lage',
        version: devDependencies?.lage,
      })
    }
  },

  pants: async (baseDir: string, rootDir: string): Promise<BuildSystem | undefined> => {
    const pants = ['pants.toml']
    const pantsConfigPath = lookFor(pants, baseDir, rootDir)

    if (pantsConfigPath) {
      return Promise.resolve({
        name: 'pants',
      })
    }
  },

  buck: async (baseDir: string, rootDir: string): Promise<BuildSystem | undefined> => {
    const buck = ['.buckconfig']
    const buckConfigPath = lookFor(buck, baseDir, rootDir)

    if (buckConfigPath) {
      return Promise.resolve({
        name: 'buck',
      })
    }
  },

  gradle: async (baseDir: string, rootDir: string): Promise<BuildSystem | undefined> => {
    const gradle = ['build.gradle']
    const gradleConfigPath = lookFor(gradle, baseDir, rootDir)

    if (gradleConfigPath) {
      return Promise.resolve({
        name: 'gradle',
      })
    }
  },

  bazel: async (baseDir: string, rootDir: string): Promise<BuildSystem | undefined> => {
    const bazel = ['.bazelrc']
    const bazelConfigPath = lookFor(bazel, baseDir, rootDir)

    if (bazelConfigPath) {
      return Promise.resolve({
        name: 'bazel',
      })
    }
  },
}

const lookFor = (configFile: string[], baseDir: string, rootDir?: string): string | undefined => {
  return findUpSync(configFile, { cwd: baseDir, stopAt: rootDir })
}

const getPkgJson = (configPath: string): PackageJson => {
  return JSON.parse(
    readFileSync(new URL(path.join(path.dirname(configPath), 'package.json'), import.meta.url), 'utf-8'),
  )
}
