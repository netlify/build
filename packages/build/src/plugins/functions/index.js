const os = require('os')
const { resolve } = require('path')

const makeDir = require('make-dir')
const pathExists = require('path-exists')
const readdirp = require('readdirp')
const { zipFunctions } = require('@netlify/zip-it-and-ship-it')

const { DEPLOY_PRIME_URL, DEPLOY_ID } = process.env

module.exports = {
  /* Hook into buildFunctions lifecycle */
  async functionsBuild({ config }) {
    const {
      build: { functions }
    } = config

    if (!functions) {
      console.log('No functions directory set. Skipping functions build step')
      return false
    }

    const functionsDir = resolve(functions)

    if (!(await pathExists(functionsDir))) {
      console.log(`Functions directory "${functionsDir}" not found`)
      throw new Error('Functions Build cancelled')
    }

    let tempFileDir = resolve('.netlify/functions')

    // Is inside netlify context
    if (DEPLOY_PRIME_URL) {
      tempFileDir = resolve(os.tmpdir(), `zisi-${DEPLOY_ID}`)
    }

    if (!(await pathExists(tempFileDir))) {
      console.log(`Temp functions directory "${tempFileDir}" not found`)
      console.log(`Creating tmp dir`, tempFileDir)
      await makeDir(tempFileDir)
    }

    try {
      console.log('Zipping functions')
      await zipFunctions(functionsDir, tempFileDir)
    } catch (err) {
      console.log('Functions bundling error')
      throw new Error(err)
    }
    const files = await readdirp.promise(tempFileDir)
    const paths = files.map(({ path }) => ` - ${path}`).join('\n')
    console.log(`Functions bundled in ${tempFileDir}:`)
    console.log(paths)
  }
}
