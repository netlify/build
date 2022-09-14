import { readFileSync } from 'fs'
import { dirname, join } from 'path'

import { findUpSync } from 'find-up'

const getPackagePath = () => {
  const packageJSONPath = findUpSync('package.json', { cwd: import.meta.url })

  // We should never get here, but let's show a somewhat useful error message.
  if (packageJSONPath === undefined) {
    throw new Error(
      'Could not find `package.json` for `@netlify/edge-bundler`. Please try running `npm install` to reinstall your dependencies.',
    )
  }

  return dirname(packageJSONPath)
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
