const path = require('path')
const execa = require('execa')
const moveCache = require('../utils/moveCache')
const { readFile, fileExists } = require('../utils/fs')

// https://github.com/netlify/build-image/blob/9e0f207a27642d0115b1ca97cd5e8cebbe492f63/run-build-functions.sh#L166
module.exports = async function installPython(cwd, cacheDir) {
  const hasPythonRuntime = await fileExists('runtime.txt')
  const hasPipFile = await fileExists('Pipfile')
  let PYTHON_VERSION = '2.7'
  if (hasPythonRuntime) {
    PYTHON_VERSION = await readFile('runtime.txt')
    try {
      await execa(['source', `$HOME/python${PYTHON_VERSION}/bin/activate`])
    } catch (err) {
      console.log('Error setting python version from runtime.txt')
      console.log('Please see https://github.com/netlify/build-image/#included-software for current versions')
      process.exit(1)
    }
    console.log(`Python version set to ${PYTHON_VERSION}`)
  } else if (hasPipFile) {
    console.log('Found Pipfile restoring Pipenv virtualenv')
    await moveCache(
      path.join(cacheDir, '.venv'),
      path.join(cwd, '.venv'),
      'restoring cached python virtualenv'
    )
  } else {
    // Default
    await execa(['source', `$HOME/python${PYTHON_VERSION}/bin/activate`])
  }
  return PYTHON_VERSION
}
