const path = require('path')

const pathExists = require('path-exists')

const { readFile } = require('../../utils/fs')
const moveCache = require('../../cache/moveCache')
const source = require('../utils/source')

// https://github.com/netlify/build-image/blob/9e0f207a27642d0115b1ca97cd5e8cebbe492f63/run-build-functions.sh#L166
module.exports = async function installPython(cwd, cacheDir) {
  const { HOME } = process.env
  const pythonRuntimeConfig = `${cwd}/runtime.txt`
  const pipFilePath = `${cwd}/Pipfile`
  let PYTHON_VERSION = '2.7'
  if (await pathExists(pythonRuntimeConfig)) {
    PYTHON_VERSION = await readFile(pythonRuntimeConfig)
    try {
      const env = await source(`${HOME}/python${PYTHON_VERSION}/bin/activate`)
      console.log('new env', env)
    } catch (err) {
      console.log('Error setting python version from runtime.txt')
      console.log('Please see https://github.com/netlify/build-image/#included-software for current versions')
      process.exit(1)
    }
    console.log(`Python version set to ${PYTHON_VERSION}`)
  } else if (await pathExists(pipFilePath)) {
    console.log('Found Pipfile restoring Pipenv virtualenv')
    await moveCache(path.join(cacheDir, '.venv'), path.join(cwd, '.venv'), 'restoring cached python virtualenv')
  } else {
    console.log('what')
    const env = await source(`${HOME}/python${PYTHON_VERSION}/bin/activate`)
    console.log('new env', env)
    // Default
    // await execa(`${HOME}/python${PYTHON_VERSION}/bin/activate`)
  }
  return PYTHON_VERSION
}
