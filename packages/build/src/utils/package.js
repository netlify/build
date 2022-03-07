import { dirname } from 'path'

import { readPackageUp } from 'read-pkg-up'

// Retrieve `package.json` from a specific directory
export const getPackageJson = async function (cwd, { normalize } = {}) {
  const packageObj = await getPackageObj({ cwd, normalize })
  if (packageObj === undefined) {
    return { packageJson: {} }
  }

  const { path, packageJson } = packageObj
  const packageDir = dirname(path)
  return { packageDir, packageJson }
}

const getPackageObj = async function ({ cwd, normalize = true }) {
  try {
    return await readPackageUp({ cwd, normalize })
    // If the `package.json` is invalid and `normalize` is `true`, an error is
    // thrown. We return `undefined` then.
  } catch {}
}
