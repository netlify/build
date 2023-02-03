import { dirname } from 'path'

import type { PathExists } from './context.js'

// Retrieve the command to run `package.json` `scripts` commands
export const getRunScriptCommand = async function ({
  pathExists,
  packageJsonPath,
}: {
  pathExists: PathExists
  packageJsonPath: string
}) {
  const yarnExists = await pathExists(`${dirname(packageJsonPath)}/yarn.lock`)
  if (yarnExists) {
    return 'yarn'
  }

  return 'npm run'
}
