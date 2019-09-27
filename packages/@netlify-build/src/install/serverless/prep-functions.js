const execa = require('execa')
const pathExists = require('path-exists')

module.exports = async function prepFunctions(functionsDir, zisiTempDir) {
  if (!functionsDir) {
    console.log(`Skipping functions preparation step: no functions directory set`)
    return false
  }
  console.log(`Function Dir: ${functionsDir}`)
  if (!(await pathExists(functionsDir))) {
    console.log(`Skipping functions preparation step: ${functionsDir} not found`)
    return false
  }

  if (zisiTempDir) {
    console.log(`Skipping functions preparation step: no temp directory set`)
    return false
  }
  console.log(`TempDir: ${zisiTempDir}`)
  const version = await getCurrentZisiVersion()
  console.log(`Prepping functions with zip-it-and-ship-it ${version}`)

  try {
    await execa('zip-it-and-ship-it', [functionsDir, zisiTempDir])
  } catch (err) {
    console.log('Error prepping functions', err)
    process.exit(1)
  }
  console.log('Prepping functions complete')
}

async function getCurrentZisiVersion() {
  let version
  try {
    const { stdout } = await execa('zip-it-and-ship-it', ['--version'])
    version = stdout
  } catch (err) {
    console.log('zip-it-and-ship-it version error', err)
    process.exit(1)
  }
  return version
}

/*
prep_functions() {
  local functionsDir=$1
  local zisiTempDir=$2

  if [[ -z "$functionsDir" ]]; then
    echo "Skipping functions preparation step: no functions directory set"
    return 0
  else
    echo Function Dir: $functionsDir
  fi

  if [[ ! -d "$functionsDir" ]]; then
    echo "Skipping functions preparation step: $functionsDir not found"
    return 0
  fi

  if [[ -z "$zisiTempDir" ]]; then
    echo "Skipping functions preparation step: no temp directory set"
  else
    echo TempDir: $zisiTempDir
  fi
  # ZISI will create this foler if it doesn't exist, we don't need to check for it

  echo Prepping functions with zip-it-and-ship-it $(zip-it-and-ship-it --version)

  if zip-it-and-ship-it $functionsDir $zisiTempDir; then
    echo "Prepping functions complete"
  else
    echo "Error prepping functions"
    exit 1
  fi
}
*/
