const pathExists = require('path-exists')
const execa = require('execa')

// Install Node.js dependencies in a specific directory
const installDependencies = async function(packageRoot) {
  if (await pathExists(`${packageRoot}/node_modules`)) {
    return
  }

  const command = await getCommand(packageRoot)

  try {
    await execa.command(command, { cwd: packageRoot, stdio: 'inherit' })
  } catch (error) {
    error.message = `Error while installing dependencies in ${packageRoot}\n${error.message}`
    throw error
  }
}

const getCommand = async function(packageRoot) {
  if (await pathExists(`${packageRoot}/yarn.lock`)) {
    return 'yarn --non-interactive --no-lockfile'
  }

  return 'npm install --no-progress --no-audit --no-package-lock'
}

module.exports = { installDependencies }
