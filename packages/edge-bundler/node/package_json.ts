import { readFileSync } from 'fs'

import { findUpSync } from 'find-up'

const getPackageVersion = () => {
  const packageJSONPath = findUpSync('package.json', { cwd: import.meta.url })

  if (packageJSONPath === undefined) {
    return ''
  }

  try {
    const packageJSON = readFileSync(packageJSONPath, 'utf8')
    const { version } = JSON.parse(packageJSON)

    return version as string
  } catch {
    return ''
  }
}

export { getPackageVersion }
