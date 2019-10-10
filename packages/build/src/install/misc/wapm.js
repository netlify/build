const path = require('path')

const execa = require('execa')
const pathExists = require('path-exists')

const moveCache = require('../../cache/moveCache')

// https://github.com/netlify/build-image/blob/9e0f207a27642d0115b1ca97cd5e8cebbe492f63/run-build-functions.sh#L558-L572
module.exports = async function installWapm(cwd, cacheDir) {
  const wapmConfig = `${cwd}/wapm.toml`
  const wapmLock = `${cwd}/wapm.lock`

  if ((await pathExists(wapmConfig)) || (await pathExists(wapmLock))) {
    // source $HOME/.wasmer/wasmer.sh
    try {
      // @ TODO verify $HOME works here
      await execa('source', ['$HOME/.wasmer/wasmer.sh'])
    } catch (err) {
      console.log('wasmer not found')
      console.log(err)
      process.exit(1)
    }

    // restore_home_cache ".wasmer/cache" "wasmer cache"
    await moveCache(
      path.join(cacheDir, '.wasmer/cache'),
      path.join(cwd, '.wasmer/cache'),
      'restoring cached wasmer cache'
    )
    // restore_cwd_cache "wapm_packages" "wapm packages"
    await moveCache(
      path.join(cacheDir, '.wasmer/cache'),
      path.join(cwd, '.wasmer/cache'),
      'restoring cached wasmer cache'
    )

    try {
      await execa('wapm', ['install'])
    } catch (err) {
      console.log('Error during Wapm install')
      console.log(err)
      process.exit(1)
    }
    console.log('Wapm packages installed')
  }
}

/*
# WAPM version
source $HOME/.wasmer/wasmer.sh
if [ -f wapm.toml ] || [ -f wapm.lock ]
then
  restore_home_cache ".wasmer/cache" "wasmer cache"
  restore_cwd_cache "wapm_packages" "wapm packages"
  wapm install
  if [ $? -eq 0 ]
  then
    echo "Wapm packages installed"
  else
    echo "Error during Wapm install"
    exit 1
  fi
fi
 */
