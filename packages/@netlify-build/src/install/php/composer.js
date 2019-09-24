const path = require('path')
const execa = require('execa')
const moveCache = require('../../utils/moveCache')
const { fileExists } = require('../../utils/fs')

// https://github.com/netlify/build-image/blob/9e0f207a27642d0115b1ca97cd5e8cebbe492f63/run-build-functions.sh#L518-L523
module.exports = async function installComposerDeps(cwd, cacheDir) {
  const composerConfig = path.join(cwd, 'composer.json')
  if (await fileExists(composerConfig)) {
    /* Restore cache */
    await moveCache(
      path.join(cacheDir, '.composer'),
      path.join(cwd, '.composer'),
      'restoring cached composer deps'
    )
    /* Run composer install */
    try {
      await execa('composer', ['install'])
    } catch (err) {
      console.log('Error installing composer deps')
      console.log(err)
    }
  }
}
