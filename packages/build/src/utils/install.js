const pathExists = require('path-exists')
const execa = require('execa')

const { addErrorInfo } = require('../error/info')

// Install Node.js dependencies in a specific directory
const installDependencies = async function(packageRoot) {
  if (await pathExists(`${packageRoot}/node_modules`)) {
    return
  }

  try {
    await execa.command('npm install --no-progress --no-audit --no-fund', {
      cwd: packageRoot,
      all: true,
    })
  } catch (error) {
    error.message = `Error while installing dependencies in ${packageRoot}\n${error.all}`
    addErrorInfo(error, { type: 'dependencies' })
    throw error
  }
}

// Add new Node.js dependencies
const addDependencies = async function({ packageRoot, packages }) {
  try {
    await execa.command(`npm install --no-progress --no-audit --no-fund ${packages.join(' ')}`, {
      cwd: packageRoot,
      all: true,
    })
  } catch (error) {
    const errorA = new Error(`Error while installing dependencies in ${packageRoot}\n${error.all}`)
    addErrorInfo(errorA, { type: 'dependencies' })
    throw errorA
  }
}

module.exports = { installDependencies, addDependencies }
