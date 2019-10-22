const { join, dirname } = require('path')

const execa = require('execa')
const mkdirp = require('mkdirp')

module.exports = {
  name: '@netlify/plugin-axe',
  init: async ({ constants }) => {
    const resultsDir = join(constants.CACHE_DIR, `axe-results`)
    mkdirp.sync(resultsDir)
    await execa('chmod', ['-R', '+rw', resultsDir])
  },
  postBuild: async ({ pluginConfig, constants }) => {
    const { site, axeFlags } = pluginConfig
    const { CACHE_DIR, CONFIG_PATH } = constants
    const testSite = site || process.env.SITE
    if (!testSite) {
      throw new Error('Site is not supplied')
    }

    const resultsPath = join(CACHE_DIR, `axe-results/result.json`)
      .replace(dirname(CONFIG_PATH), '')
      .replace(/^\//, '')

    await execa.command(`axe ${testSite} ${axeFlags} --save ${resultsPath}`, {
      preferLocal: true,
      stdio: 'inherit',
    })

    let results = require(resultsPath)
    if (results && results[0]) {
      results = results[0].violations
    }
    console.log({ violations: results })
  },
}
