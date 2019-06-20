const path = require('path')
const execa = require('execa')
const setTempDir = require('./utils/set-temp-dir')
const shasum = require('../../utils/shasum')
const shouldInstallDeps = require('../../utils/shouldInstallDeps')
const { writeFile } = require('../../utils/fs')

// https://github.com/netlify/build-image/blob/9e0f207a27642d0115b1ca97cd5e8cebbe492f63/run-build-functions.sh#L119-L157
module.exports = async function runNpm(cwd, cacheDir) {
  const { NPM_VERSION, NODE_VERSION } = process.env
  let npmVersion = NPM_VERSION

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

  /* Check cache & run `npm install` if we need to */
  const packageJSON = path.join(cwd, 'package.json')
  const previousSha = path.join(cacheDir, 'package-sha')
  if (await shouldInstallDeps(packageJSON, NODE_VERSION, previousSha)) {
    console.log(`Installing NPM modules using NPM version ${npmVersion}`)
    await setTempDir()
    /* do npm install " npm install ${NPM_FLAGS:+"$NPM_FLAGS"} " */
    try {
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
    const resp = await execa('npm', ['bin'])
    process.env.PATH = `${resp.stdout}:${process.env.PATH}`
  }
}
