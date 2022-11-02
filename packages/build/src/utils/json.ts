import { promises as fs, readFileSync } from 'fs'
import { fileURLToPath } from 'url'

import { PackageJson } from 'read-pkg-up'

const ROOT_PACKAGE_JSON_PATH = fileURLToPath(new URL('../../package.json', import.meta.url))

// TODO: Replace with dynamic `import()` once it is supported without
// experimental flags
export const importJsonFile = async function (filePath: string) {
  const fileContents = await fs.readFile(filePath, 'utf-8')
  return JSON.parse(fileContents)
}

const importJsonFileSync = function (filePath: string) {
  // Use sync I/O so it is easier to migrate to `import()` later on
  const fileContents = readFileSync(filePath, 'utf-8')
  return JSON.parse(fileContents)
}

export const ROOT_PACKAGE_JSON: PackageJson = importJsonFileSync(ROOT_PACKAGE_JSON_PATH)
