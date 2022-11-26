import { readdirSync } from 'fs'

export const detectBuildSystem = (rootDir: string): string[] => {
  const buildTools = Object.keys(BUILD_SYSTEMS)
  const files = readdirSync(rootDir)

  return buildTools.map((tool) => BUILD_SYSTEMS[tool](files))
}

const BUILD_SYSTEMS = {
  nx: (files: string[]): string => {
    const nx = ['nx.json']

    if (configFilesExistsFor(nx, files)) return 'nx'
    return ''
  },
  lerna: (files: string[]): string => {
    const lerna = ['lerna.json']

    if (configFilesExistsFor(lerna, files)) return 'lerna'
    return ''
  },
}

const configFilesExistsFor = (configFiles: string[], files: string[]): boolean => {
  const foundConfigs = configFiles.filter((f) => files.includes(f))
  return foundConfigs.length > 0
}
