const os = require('os')
const path = require('path')

const makeDir = require('make-dir')
const pathExists = require('path-exists')
const { zipFunctions } = require('@netlify/zip-it-and-ship-it')

const { readDir } = require('../../utils/fs')
const { DEPLOY_PRIME_URL, DEPLOY_ID } = process.env

module.exports = {
  /* Hook into buildFunctions lifecycle */
  buildFunctions: async ({ config }) => {
    const { build } = config
    if (!build || !build.functions) {
      console.log('No functions directory set. Skipping functions build step')
      return false
    }

    if (!(await pathExists(build.functions))) {
      console.log(`Functions directory "${build.functions}" not found`)
      throw new Error('Functions Build cancelled')
    }

    let tempFileDir = path.join(process.cwd(), '.netlify', 'functions')

    // Is inside netlify context
    if (DEPLOY_PRIME_URL) {
      tempFileDir = path.join(os.tmpdir(), `zisi-${DEPLOY_ID}`)
    }

    if (!(await pathExists(tempFileDir))) {
      console.log(`Temp functions directory "${tempFileDir}" not found`)
      console.log(`Creating tmp dir`, tempFileDir)
      await makeDir(tempFileDir)
    }

    try {
      console.log('Zipping functions')
      await zipFunctions(build.functions, tempFileDir)
    } catch (err) {
      console.log('Functions bundling error')
      throw new Error(err)
    }
    console.log('Functions bundled!')
    const funcs = await readDir(tempFileDir)
    console.log(funcs)
  }
}
