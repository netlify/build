const path = require('path')

const execa = require('execa')
const pathExists = require('path-exists')

const moveCache = require('../../cache/moveCache')

const install = require('./utils/install')

// https://github.com/netlify/build-image/blob/9e0f207a27642d0115b1ca97cd5e8cebbe492f63/run-build-functions.sh#L380
module.exports = async function installBower(cwd, cacheDir) {
  const bowerFile = `${cwd}/bower.json`

  if (await pathExists(bowerFile)) {
    let hasBowerInstalled
    try {
      const { stdout } = await execa('which', ['bower'])
      if (stdout) hasBowerInstalled = true
    } catch (error) {
      hasBowerInstalled = false
    }

    if (!hasBowerInstalled) {
      await install('bower', cwd)

      /* What does this do?
      export PATH=$(npm bin):$PATH
        verify below code
      */
      const resp = await execa('npm', ['bin'])
      process.env.PATH = `${resp.stdout}:${process.env.PATH}`
    }

    // Restore cached bower components
    await moveCache(
      path.join(cacheDir, 'bower_components'),
      path.join(cwd, 'bower_components'),
      'restoring cached bower_components'
    )

    // TODO move elsewhere. Seperate setup `bower` from the `bower install` steps
    try {
      // Todo verify flags "bower install --config.interactive=false"
      await execa('bower', ['install', '--config.interactive', false])
    } catch (err) {
      console.log(`Error installing bower components`)
    }

    console.log('Bower components installed')
  }
}
