import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

import { findUpSync, pathExistsSync } from 'find-up'

const getPackagePath = () => {
  const packagePath = findUpSync(
    (directory: string) => {
      if (pathExistsSync(join(directory, 'package.json'))) {
        return directory
      }
    },
    { cwd: fileURLToPath(import.meta.url), type: 'directory' },
  )

  // We should never get here, but let's show a somewhat useful error message.
  if (packagePath === undefined) {
    throw new Error(
      'Could not find `package.json` for `@netlify/edge-bundler`. Please try running `npm install` to reinstall your dependencies.',
    )
  }

  return packagePath
}

const getPackageVersion = () => {
  const packagePath = getPackagePath()

  try {
    const packageJSON = readFileSync(join(packagePath, 'package.json'), 'utf8')
    const { version } = JSON.parse(packageJSON)

    return version as string
  } catch {
    return ''
  }
}

export { getPackagePath, getPackageVersion }
