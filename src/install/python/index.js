const path = require('path')
const execa = require('execa')
const moveCache = require('../../utils/moveCache')
const { readFile, fileExists } = require('../../utils/fs')

// https://github.com/netlify/build-image/blob/9e0f207a27642d0115b1ca97cd5e8cebbe492f63/run-build-functions.sh#L166
module.exports = async function installPython(cwd, cacheDir) {
  const { HOME } = process.env
  const pythonRuntimeConfig = path.join(cwd, 'runtime.txt')
  const pipFilePath = path.join(cwd, 'Pipfile')
  let PYTHON_VERSION = '2.7'
  if (await fileExists(pythonRuntimeConfig)) {
    PYTHON_VERSION = await readFile(pythonRuntimeConfig)
    try {
      await execa('source', [`${HOME}/python${PYTHON_VERSION}/bin/activate`])
    } catch (err) {
      console.log('Error setting python version from runtime.txt')
      console.log('Please see https://github.com/netlify/build-image/#included-software for current versions')
      process.exit(1)
    }
    console.log(`Python version set to ${PYTHON_VERSION}`)
  } else if (await fileExists(pipFilePath)) {
    console.log('Found Pipfile restoring Pipenv virtualenv')
    await moveCache(
      path.join(cacheDir, '.venv'),
      path.join(cwd, '.venv'),
      'restoring cached python virtualenv'
    )
  } else {
    // Default
    await execa('source', [`$HOME/python${PYTHON_VERSION}/bin/activate`])
  }
  return PYTHON_VERSION
}
