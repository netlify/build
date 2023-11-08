import pLocate from 'p-locate'

import type { PathExists } from './context.js'
import type { FrameworkDefinition } from './types.js'

// Checks if the project is using a specific framework:
//  - if `framework.npmDependencies` is set, one of them must be present in the
//    `package.json` `dependencies|devDependencies`
//  - if `framework.excludedNpmDependencies` is set, none of them must be
//    present in the `package.json` `dependencies|devDependencies`
//  - if `framework.configFiles` is set, one of the files must exist
export const usesFramework = async function (
  {
    detect: {
      npmDependencies: frameworkNpmDependencies,
      excludedNpmDependencies: frameworkExcludedNpmDependencies,
      configFiles,
    },
  }: FrameworkDefinition,
  { pathExists, npmDependencies }: { pathExists: PathExists; npmDependencies: string[] },
): Promise<boolean> {
  return (
    usesNpmDependencies(frameworkNpmDependencies, npmDependencies) &&
    lacksExcludedNpmDependencies(frameworkExcludedNpmDependencies, npmDependencies) &&
    (await usesConfigFiles(configFiles, pathExists))
  )
}

const usesNpmDependencies = function (frameworkNpmDependencies: string[], npmDependencies: string[]): boolean {
  return (
    frameworkNpmDependencies.length === 0 ||
    frameworkNpmDependencies.some((frameworkNpmDependency) => npmDependencies.includes(frameworkNpmDependency))
  )
}

const lacksExcludedNpmDependencies = function (
  frameworkExcludedNpmDependencies: string[],
  npmDependencies: string[],
): boolean {
  return frameworkExcludedNpmDependencies.every(
    (frameworkNpmDependency) => !npmDependencies.includes(frameworkNpmDependency),
  )
}

const configExists = async (configFiles: string[], pathExists: PathExists): Promise<boolean> => {
  const exists = await pLocate(configFiles, (file: string) => pathExists(file))
  return !!exists
}

const usesConfigFiles = async function (configFiles: string[], pathExists: PathExists): Promise<boolean> {
  return configFiles.length === 0 || (await configExists(configFiles, pathExists))
}
