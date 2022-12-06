import { readFileSync } from 'fs'
import path from 'path'

import { findUpSync } from 'find-up'
import { PackageJson } from 'read-pkg'

export type BuildSystem = {
  name: string
  version: string | undefined
}

export const detectBuildSystems = (baseDir: string, rootDir?: string): BuildSystem[] => {
  const buildTools = Object.keys(BUILD_SYSTEMS)

  return buildTools.map((tool) => BUILD_SYSTEMS[tool](baseDir, rootDir)).filter((tool) => tool != undefined)
}

const BUILD_SYSTEMS = {
  nx: (baseDir: string, rootDir?: string): BuildSystem | undefined => {
    const nx = ['nx.json']
    const nxConfigPath = lookFor(nx, baseDir, rootDir)

    if (nxConfigPath) {
      const pkgJson = getPkgJson(nxConfigPath)
      const { devDependencies } = pkgJson

      return {
        name: 'nx',
        version: devDependencies?.nx,
      }
    }
  },

  lerna: (baseDir: string, rootDir?: string): BuildSystem | undefined => {
    const lerna = ['lerna.json']
    const lernaConfigPath = lookFor(lerna, baseDir, rootDir)

    if (lernaConfigPath) {
      const pkgJson = getPkgJson(lernaConfigPath)
      const { devDependencies } = pkgJson

      return {
        name: 'lerna',
        version: devDependencies?.lerna,
      }
    }
  },

  turbo: (baseDir: string, rootDir?: string): BuildSystem | undefined => {
    const turbo = ['turbo.json']
    const turboConfigPath = lookFor(turbo, baseDir, rootDir)

    if (turboConfigPath) {
      const pkgJson = getPkgJson(turboConfigPath)
      const { devDependencies } = pkgJson

      return {
        name: 'turbo',
        version: devDependencies?.turbo,
      }
    }
  },

  rush: (baseDir: string, rootDir?: string): BuildSystem | undefined => {
    const rush = ['rush.json']
    const rushConfigPath = lookFor(rush, baseDir, rootDir)

    if (rushConfigPath) {
      const pkgJson = getPkgJson(rushConfigPath)
      const { devDependencies } = pkgJson

      return {
        name: 'rush',
        version: devDependencies?.rush,
      }
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
