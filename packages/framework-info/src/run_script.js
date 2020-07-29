const { dirname } = require('path')

const pathExists = require('path-exists')

// Retrieve the command to run `package.json` `scripts` commands
const getRunScriptCommand = async function({ projectDir, packageJsonPath = projectDir }) {
  if (await pathExists(`${dirname(packageJsonPath)}/yarn.lock`)) {
    return 'yarn'
  }

  return 'npm run'
}

module.exports = { getRunScriptCommand }
