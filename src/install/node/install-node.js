const path = require('path')
const execa = require('execa')
const {
  readFile,
  writeFile,
  fileExists,
  removeFiles,
  copyFiles
} = require('../utils/fs')

// https://github.com/netlify/build-image/blob/9e0f207a27642d0115b1ca97cd5e8cebbe492f63/run-build-functions.sh#L186
module.exports = async function installNode(cwd, cacheDir, version) {
  let NODE_VERSION = version
  const { NVM_DIR, NPM_TOKEN } = process.env
  await execa('source', [`${NVM_DIR}/nvm.sh`])

  const nodeVersionCache = path.join(cacheDir, 'node_version')
  if (await fileExists(nodeVersionCache)) {
    // Clear nvm dir
    console.log('Started restoring cached node version')
    await removeFiles([`${NVM_DIR}/versions/node/*`])
    // Copy cached node
    await copyFiles(nodeVersionCache, `${NVM_DIR}/versions/node/`)
    console.log('Finished restoring cached node version')
  }

  const nvmRcPath = path.join(cwd, 'nvmrc')
  const nodeVersionPath = path.join(cwd, '.node-version')
  if (await fileExists(nvmRcPath)) {
    NODE_VERSION = await readFile(nvmRcPath)
    console.log(`Attempting node version '${NODE_VERSION}' from .nvmrc`)
  } else if (await fileExists(nodeVersionPath)) {
    NODE_VERSION = await readFile(nvmRcPath)
    console.log(`Attempting node version '${NODE_VERSION}' from .node-version`)
  }

  /* install */
  try {
    await execa('nvm', ['install', NODE_VERSION])
    // Get version
    NODE_VERSION = await execa('nvm', ['current'])
    if (NODE_VERSION === 'none') { // todo harden this
      const debug = await execa('nvm', ['debug'])
      if (debug.stdout) {
        console.log(debug.stdout)
      }
      const envCommand = await execa('env')
      if (envCommand.stdout) {
        console.log(envCommand.stdout)
      }
    }
  } catch (err) {
    console.log(`Failed to install node version '${NODE_VERSION}'`)
    console.log('err', err)
    process.exit(1)
  }

  // Set NPM token if one set
  const npmConfigPath = path.join(cwd, 'npmrc')
  if (NPM_TOKEN && !await fileExists(npmConfigPath)) {
    await writeFile(npmConfigPath, `//registry.npmjs.org/:_authToken=${NPM_TOKEN}`)
  }
}
