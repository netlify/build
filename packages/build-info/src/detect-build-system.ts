import { readFileSync } from 'fs'
import path from 'path'

import { findUpSync } from 'find-up'
import { PackageJson } from 'read-pkg'

export type BuildSystem = {
  name: string
  version?: string | undefined
}

type BuildSystemHandler = (baseDir: string, rootDir?: string) => Promise<BuildSystem | undefined>

export const detectBuildSystems = async (baseDir: string, rootDir?: string): Promise<BuildSystem[]> => {
  const buildTools = Object.keys(BUILD_SYSTEMS)
  const buildSystems = await Promise.all(buildTools.map(async (tool) => await BUILD_SYSTEMS[tool](baseDir, rootDir)))

  return buildSystems.reduce((res, tool) => {
    if (tool) {
      res.push(tool)
    }

    return res
  }, [] as BuildSystem[])
}

const BUILD_SYSTEMS: Record<string, BuildSystemHandler> = {
  nx: async (baseDir, rootDir) => {
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

  lerna: async (baseDir, rootDir) => {
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

  turbo: async (baseDir, rootDir) => {
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

  rush: async (baseDir, rootDir) => {
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

  lage: async (baseDir, rootDir) => {
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

  pants: async (baseDir, rootDir) => {
    const pants = ['pants.toml']
    const pantsConfigPath = lookFor(pants, baseDir, rootDir)

    if (pantsConfigPath) {
      return Promise.resolve({
        name: 'pants',
      })
    }
  },

  buck: async (baseDir, rootDir) => {
    const buck = ['.buckconfig', 'BUCK']
    const buckConfigPath = lookFor(buck, baseDir, rootDir)

    if (buckConfigPath) {
      return Promise.resolve({
        name: 'buck',
      })
    }
  },

  gradle: async (baseDir, rootDir) => {
    const gradle = ['build.gradle']
    const gradleConfigPath = lookFor(gradle, baseDir, rootDir)

    if (gradleConfigPath) {
      return Promise.resolve({
        name: 'gradle',
      })
    }
  },

  bazel: async (baseDir, rootDir) => {
    const bazel = ['.bazelrc', 'WORKSPACE', 'WORKSPACE.bazel', 'BUILD.bazel']
    const bazelConfigPath = lookFor(bazel, baseDir, rootDir)

    if (bazelConfigPath) {
      return Promise.resolve({
        name: 'bazel',
      })
    }
  },

  moon: async (baseDir, rootDir) => {
    const moon = ['.moon']
    const moonConfigPath = lookFor(moon, baseDir, rootDir, 'directory')

    if (moonConfigPath) {
      const pkgJson = getPkgJson(moonConfigPath)
      const { devDependencies } = pkgJson

      return Promise.resolve({
        name: 'moon',
        version: devDependencies?.moon,
      })
    }
  },
}

const lookFor = (
  configFile: string[],
  baseDir: string,
  rootDir?: string,
  type?: 'file' | 'directory',
): string | undefined => {
  return findUpSync(configFile, { cwd: baseDir, stopAt: rootDir, type: type })
}

const getPkgJson = (configPath: string): PackageJson => {
  let pkgJson: PackageJson = {};
  try {
    pkgJson = JSON.parse(readFileSync(path.join(path.dirname(configPath), 'package.json'), 'utf-8'))
  } catch {
    // noop
  }
  return pkgJson
}
