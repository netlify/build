import { fileURLToPath } from 'url'

import type { PackageJson } from 'read-package-up'

export type RootPackageJson = { name: string; version: string }

const ROOT_PACKAGE_JSON_PATH = fileURLToPath(new URL('../../package.json', import.meta.url))

export const importJsonFile = async function (filePath: string): Promise<PackageJson> {
  const fileUrl = filePath.startsWith('file://') ? filePath : `file://${filePath}`

  const module = (await import(fileUrl, { assert: { type: 'json' } })) as { default: PackageJson }
  return module.default
}

export const ROOT_PACKAGE_JSON = (await importJsonFile(ROOT_PACKAGE_JSON_PATH)) as RootPackageJson
