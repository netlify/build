const path = require('path')

const execa = require('execa')

const { writeFile } = require('../../utils/fs')
const shasum = require('../utils/shasum')
const shouldInstallDeps = require('../utils/shouldInstallDeps')

const setTempDir = require('./utils/set-temp-dir')

// https://github.com/netlify/build-image/blob/9e0f207a27642d0115b1ca97cd5e8cebbe492f63/run-build-functions.sh#L119-L157
module.exports = async function runNpm(cwd, cacheDir) {
  const { NPM_VERSION, NODE_VERSION } = process.env
  let npmVersion = NPM_VERSION
  console.log('ha')
  // Verify version match
  if (NPM_VERSION) {
    const version = await execa('npm', ['--version'])
    if (version.stdout !== NPM_VERSION) {
      npmVersion = version.stdout
      console.log(`Found npm version "${npmVersion}" that doesn't match expected (${NPM_VERSION})`)
      console.log(`Installing npm at version ${NPM_VERSION}`)
      try {
        await execa('npm', ['install', '-g', `npm@${NPM_VERSION}`])
      } catch (err) {
        console.log(`Error installing npm@${NPM_VERSION}`)
        console.log('err', err)
        process.exit(1)
      }
    }
  }
  console.log('NPM_VERSION', NPM_VERSION)
  /* Check cache & run `npm install` if we need to */
  const packageJSON = path.join(cwd, 'package.json')
  const previousSha = path.join(cacheDir, 'package-sha')
  console.log('previousSha', previousSha)
  if (await shouldInstallDeps(packageJSON, NODE_VERSION, previousSha)) {
    console.log(`Installing NPM modules using NPM version ${npmVersion}`)
    await setTempDir()
    /* do npm install " npm install ${NPM_FLAGS:+"$NPM_FLAGS"} " */
    try {
      console.log('run install via npm')
      await execa('npm', ['install']) // TODO FLAGS
    } catch (err) {
      console.log('Error installing NPM')
      process.exit(1)
    }

    /* write new shasum to file */
    // echo "$(shasum package.json)-$NODE_VERSION" > $NETLIFY_CACHE_DIR/package-sha
    const sha = await shasum(packageJSON)
    const newSha = `${sha}-${NODE_VERSION}`
    await writeFile(previousSha, newSha)

    /* What does this do?
    export PATH=$(npm bin):$PATH
      verify below code
    */
    const { stdout } = await execa('npm', ['bin'])
    process.env.PATH = `${stdout}:${process.env.PATH}`
  }
}
