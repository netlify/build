const pathExists = require('path-exists')
const execa = require('execa')

// Install Node.js dependencies in a specific directory
const installDependencies = async function(packageRoot) {
  if (await pathExists(`${packageRoot}/node_modules`)) {
    return
  }

  const command = await getCommand(packageRoot)

  try {
    await execa.command(command, { cwd: packageRoot, stdio: 'inherit', preferLocal: true })
  } catch (error) {
    error.message = `Error while installing dependencies in ${packageRoot}\n${error.message}`
    throw error
  }
}

const getCommand = async function(packageRoot) {
  if (await pathExists(`${packageRoot}/yarn.lock`)) {
    return 'yarn --non-interactive --no-lockfile --disable-pnp'
  }

  return 'npm install --no-progress --no-audit --no-fund --no-package-lock'
}

// Add new Node.js dependencies
const addDependency = async function(packageName, { packageRoot, stdio }) {
  const command = await getAddCommand(packageName, packageRoot)
  await execa.command(command, { cwd: packageRoot, stdio })
}

const getAddCommand = async function(packageName, packageRoot) {
  if (await pathExists(`${packageRoot}/yarn.lock`)) {
    return `yarn add --non-interactive --disable-pnp ${packageName}`
  }

  return `npm install --no-progress --no-audit --no-fund ${packageName}`
}

module.exports = { installDependencies, addDependency }
