import { readFile } from 'fs/promises'
import { fileURLToPath } from 'url'

import type { PackageJson } from 'read-package-up'
// We know how our package.json looks like, so we can be very specific with the type
// and only add the properties we want to use
export type RootPackageJson = { name: string; version: string }

const ROOT_PACKAGE_JSON_PATH = fileURLToPath(new URL('../../package.json', import.meta.url))

// TODO: Replace with dynamic `import()` once it is supported without
// experimental flags
export const importJsonFile = async function (filePath: string): Promise<PackageJson> {
  const fileContents = await readFile(filePath, 'utf-8')

  return JSON.parse(fileContents) as PackageJson
}

export const ROOT_PACKAGE_JSON = (await importJsonFile(ROOT_PACKAGE_JSON_PATH)) as RootPackageJson
