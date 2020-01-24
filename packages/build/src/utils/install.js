const pathExists = require('path-exists')
const execa = require('execa')

// Install Node.js dependencies in a specific directory
const installDependencies = async function(packageRoot) {
  if (await pathExists(`${packageRoot}/node_modules`)) {
    return
  }

  try {
    await execa.command('npm install --no-progress --no-audit --no-fund --no-package-lock', {
      cwd: packageRoot,
      stdio: 'inherit',
      preferLocal: true,
    })
  } catch (error) {
    error.message = `Error while installing dependencies in ${packageRoot}\n${error.message}`
    throw error
  }
}

// Add new Node.js dependencies
const addDependency = async function(packageName, { packageRoot, stdio }) {
  await execa.command(`npm install --no-progress --no-audit --no-fund ${packageName}`, { cwd: packageRoot, stdio })
}

module.exports = { installDependencies, addDependency }
