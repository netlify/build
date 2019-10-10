const path = require('path')

const execa = require('execa')
const pathExists = require('path-exists')

const moveCache = require('../../cache/moveCache')

// https://github.com/netlify/build-image/blob/9e0f207a27642d0115b1ca97cd5e8cebbe492f63/run-build-functions.sh#L334-L364
module.exports = async function installPipDeps(cwd, cacheDir) {
  const { PIPENV_RUNTIME, HOME } = process.env
  const requirementsPath = `${cwd}/requirements.txt`
  const pipFilePath = `${cwd}/Pipfile`
  if (await pathExists(requirementsPath)) {
    console.log('Installing pip dependencies')
    await moveCache(path.join(cacheDir, '.cache'), path.join(cwd, '.cache'), 'restoring cached python cached deps')
    try {
      await execa('pip', ['install', '-r', path.normalize(requirementsPath)])
    } catch (err) {
      console.log('Error installing pip dependencies')
      process.exit(1)
    }
    console.log('Pip dependencies installed')
  } else if (await pathExists(pipFilePath)) {
    console.log('Installing dependencies from Pipfile')
    try {
      await execa(`${HOME}/python${PIPENV_RUNTIME}/bin/pipenv`, ['install'])
    } catch (err) {
      console.log('Error installing Pipenv dependencies')
      console.log('Please see https://github.com/netlify/build-image/#included-software for current versions')
      process.exit(1)
    }
    console.log('Pipenv dependencies installed')

    try {
      // source $($HOME/python$PIPENV_RUNTIME/bin/pipenv --venv)/bin/activate
      await execa('source', ['$($HOME/python$PIPENV_RUNTIME/bin/pipenv --venv)/bin/activate'])
      const pythonVersion = await getPythonVersion()
      console.log(`Python version set to ${pythonVersion}`)
    } catch (err) {
      console.log('Error activating Pipenv environment')
      process.exit(1)
    }
  }
}

async function getPythonVersion() {
  let version
  try {
    const { stdout } = await execa('python', ['-V'])
    version = stdout
  } catch (err) {
    console.log('No python found', err)
  }
  return version
}

/* original logic
# PIP dependencies
if [ -f requirements.txt ]
then
  echo "Installing pip dependencies"
  restore_home_cache ".cache" "pip cache"
  if pip install -r requirements.txt
  then
    echo "Pip dependencies installed"
  else
    echo "Error installing pip dependencies"
    exit 1
  fi
elif [ -f Pipfile ]
then
  echo "Installing dependencies from Pipfile"
  if $HOME/python$PIPENV_RUNTIME/bin/pipenv install
  then
    echo "Pipenv dependencies installed"
    if source $($HOME/python$PIPENV_RUNTIME/bin/pipenv --venv)/bin/activate
    then
      echo "Python version set to $(python -V)"
    else
      echo "Error activating Pipenv environment"
      exit 1
    fi
  else
    echo "Error installing Pipenv dependencies"
    echo "Please see https://github.com/netlify/build-image/#included-software for current versions"
    exit 1
  fi
fi
 */
