const os = require('os')
const path = require('path')
const makeDir = require('make-dir')
const { fileExists, readDir } = require('../../utils/fs')
const { zipFunctions } = require('@netlify/zip-it-and-ship-it')
const { DEPLOY_PRIME_URL, DEPLOY_ID } = process.env

module.exports = {
  /* Plugin namespace */
  name: '@netlify/function',

  /* Hook into buildFunctions lifecycle */
  buildFunctions: async ({ netlifyConfig }) => {
    const { build } = netlifyConfig
    if (!build || !build.functions) {
      console.log('No functions directory set. Skipping functions build step')
      return false
    }

    if (!await fileExists(build.functions)) {
      console.log(`Functions directory "${build.functions}" not found`)
      throw new Error('Functions Build cancelled')
    }

    let tempFileDir = path.join(process.cwd(), '.netlify', 'functions')

    // Is inside netlify context
    if (DEPLOY_PRIME_URL) {
      tempFileDir = path.join(os.tmpdir(), `zisi-${DEPLOY_ID}`)
    }

    if (!await fileExists(tempFileDir)) {
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
