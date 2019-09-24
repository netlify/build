const path = require('path')
const moveCache = require('../../utils/moveCache')
const runNpm = require('./run-npm')
const runYarn = require('./run-yarn')
const { fileExists } = require('../../utils/fs')

// Install Node project deps
// https://github.com/netlify/build-image/blob/9e0f207a27642d0115b1ca97cd5e8cebbe492f63/run-build-functions.sh#L366-L378
module.exports = async function installNodeDeps(cwd, cacheDir, yarnVersion) {
  const packageJSON = path.join(cwd, 'package.json')
  const yarnLock = path.join(cwd, 'yarn.lock')

  if (await fileExists(packageJSON)) {
    // Restory cache node_modules
    await moveCache(
      path.join(cacheDir, 'node_modules'),
      path.join(cwd, 'node_modules'),
      'restoring cached node_modules'
    )
    console.log('ho')

    if (await fileExists(yarnLock)) {
      await runYarn(cwd, cacheDir, yarnVersion)
    } else {
      await runNpm(cwd, cacheDir)
    }
  }
}
