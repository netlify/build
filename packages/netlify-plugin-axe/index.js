const {
  cwd,
  env: { SITE },
} = require('process')

const execa = require('execa')
const makeDir = require('make-dir')

module.exports = {
  name: '@netlify/plugin-axe',
  config: {
    required: ['site'],
    properties: {
      site: { type: 'string', default: SITE },
      axeFlags: { type: 'string' },
    },
  },
  async postBuild({ pluginConfig: { site, axeFlags }, constants: { CACHE_DIR } }) {
    const resultsDir = `${CACHE_DIR}/axe-results`
    await makeDir(resultsDir)

    const resultsPath = `${resultsDir}/result.json`.replace(cwd(), '').replace(/^\//, '')

    await execa.command(`axe ${site} ${axeFlags} --save ${resultsPath}`, {
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
