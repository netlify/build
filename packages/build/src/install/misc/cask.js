const path = require('path')

const execa = require('execa')
const pathExists = require('path-exists')

const moveCache = require('../../cache/moveCache')

// https://github.com/netlify/build-image/blob/9e0f207a27642d0115b1ca97cd5e8cebbe492f63/run-build-functions.sh#L507-L516
module.exports = async function installCaskDeps(cwd, cacheDir) {
  const caskFile = `${cwd}/Cask`

  const caskCacheFolder = path.join(cacheDir, '.cache')
  const caskFolder = path.join(cwd, '.cache')

  if (await pathExists(caskFile)) {
    // restore_home_cache ".cask" "emacs cask dependencies"
    await moveCache(caskCacheFolder, caskFolder, 'restoring cached emacs cask dependencies')
    // restore_home_cache ".emacs.d" "emacs cache"
    await moveCache(path.join(cacheDir, '.emacs.d'), path.join(cwd, '.emacs.d'), 'restoring cached emacs cache')

    try {
      await execa('cask', ['install'])
    } catch (err) {
      console.log('Error installing cask deps')
      console.log(err)
      process.exit(1)
    }
    console.log('Emacs packages installed')
  }
}

/*
# Cask
if [ -f Cask ]
then
  restore_home_cache ".cask" "emacs cask dependencies"
  restore_home_cache ".emacs.d" "emacs cache"
  if cask install
  then
    echo "Emacs packages installed"
    fi
fi
 */
