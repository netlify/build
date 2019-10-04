const os = require('os')
const { resolve, join } = require('path')

const makeDir = require('make-dir')
const pathExists = require('path-exists')
const { zipFunctions } = require('@netlify/zip-it-and-ship-it')

const { readDir } = require('../../utils/fs')
const { DEPLOY_PRIME_URL, DEPLOY_ID } = process.env

module.exports = {
  /* Hook into buildFunctions lifecycle */
  buildFunctions: async ({
    config: {
      build: { functions }
    },
    constants: { BASE_DIR }
  }) => {
    if (!functions) {
      console.log('No functions directory set. Skipping functions build step')
      return false
    }

    const functionsDir = resolve(BASE_DIR, functions)

    if (!(await pathExists(functionsDir))) {
      console.log(`Functions directory "${functionsDir}" not found`)
      throw new Error('Functions Build cancelled')
    }

    let tempFileDir = join(BASE_DIR, '.netlify', 'functions')

    // Is inside netlify context
    if (DEPLOY_PRIME_URL) {
      tempFileDir = join(os.tmpdir(), `zisi-${DEPLOY_ID}`)
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
    console.log('Functions bundled!')
    const funcs = await readDir(tempFileDir)
    console.log(funcs)
  }
}
