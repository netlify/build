import { includeKeys } from 'filter-obj'
import isPlainObj from 'is-plain-obj'
import type { PackageJson } from 'read-pkg-up'

export const getPackageJsonContent = function (packageJson: PackageJson | undefined) {
  if (packageJson === undefined) {
    return { npmDependencies: {}, scripts: {} }
  }

  const npmDependencies = getNpmDependencies(packageJson)
  const scripts = getScripts(packageJson)

  return { npmDependencies, scripts }
}

// Retrieve `package.json` `dependencies` and `devDependencies` names
const getNpmDependencies = function ({
  dependencies,
  devDependencies,
}: PackageJson): Record<string, string | undefined> {
  return {
    ...(dependencies ?? {}),
    ...(devDependencies ?? {}),
  }
}

// Retrieve `package.json` `scripts`
const getScripts = function ({ scripts }: PackageJson): Record<string, string> {
  if (!isPlainObj(scripts)) {
    return {}
  }

  return includeKeys(scripts, isValidScript) as Record<string, string>
}

const isValidScript = function (_key: unknown, value: any): value is string {
  return typeof value === 'string'
}
