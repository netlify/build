import { readFileSync } from 'fs'
import path from 'path'

import { findUpSync } from 'find-up'
import { PackageJson } from 'read-pkg'

export const detectBuildSystem = (rootDir: string, baseDir: string): string[] => {
  const buildTools = Object.keys(BUILD_SYSTEMS)

  return buildTools.map((tool) => BUILD_SYSTEMS[tool](rootDir, baseDir)).filter((tool) => tool != undefined)
}

type BuildSystem = {
  name: string
  version: string | undefined
}

const BUILD_SYSTEMS = {
  nx: (rootDir: string, baseDir: string): BuildSystem | undefined => {
    const nx = ['nx.json']
    const nxConfigPath = lookFor(nx, rootDir, baseDir)

    if (nxConfigPath) {
      const pkgJson = getPkgJson(nxConfigPath)
      const { devDependencies } = pkgJson

      return {
        name: 'nx',
        version: devDependencies?.nx,
      }
    }
  },

  lerna: (rootDir: string, baseDir: string): BuildSystem | undefined => {
    const lerna = ['lerna.json']
    const lernaConfigPath = lookFor(lerna, rootDir, baseDir)

    if (lernaConfigPath) {
      const pkgJson = getPkgJson(lernaConfigPath)
      const { devDependencies } = pkgJson
      return {
        name: 'lerna',
        version: devDependencies?.lerna,
      }
    }
  },
}

const lookFor = (configFile: string[], rootDir: string, baseDir: string): string | undefined => {
  return findUpSync(configFile, { cwd: baseDir, stopAt: rootDir })
}

const getPkgJson = (configPath: string): PackageJson => {
  return JSON.parse(
    readFileSync(new URL(path.join(path.dirname(configPath), 'package.json'), import.meta.url), 'utf-8'),
  )
}
