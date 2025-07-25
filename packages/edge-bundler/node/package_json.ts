import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

import { file as findUp } from 'empathic/find'

const getPackagePath = () => {
  const packageJsonPath = findUp('package.json', { cwd: dirname(fileURLToPath(import.meta.url)) })
  const packagePath = packageJsonPath ? dirname(packageJsonPath) : undefined

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
