import { dirname } from 'path'

// Retrieve the command to run `package.json` `scripts` commands
export const getRunScriptCommand = async function ({ pathExists, packageJsonPath }) {
  const yarnExists = await pathExists(`${dirname(packageJsonPath)}/yarn.lock`)
  if (yarnExists) {
    return 'yarn'
  }

  return 'npm run'
}
