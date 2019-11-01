const { resolve } = require('path')

const execa = require('execa')
const chalk = require('chalk')
const Conf = require('conf') // for simple kv store

// // TODO: enable this in production
// const NETLIFY_BUILD_BASE = '/opt/buildhome'

module.exports = {
  name: '@netlify/plugin-lighthouse',
  // users will be tempted to use semver, but we really don't care
  postDeploy: async ({ pluginConfig }) => {
    let { site = process.env.SITE, currentVersion, compareWithVersion = 'init' } = pluginConfig

    if (typeof currentVersion === `undefined`) {
      console.log(`lighthouseplugin version not specified, auto assigning ${chalk.yellow("currentVersion='init'")}`)
      currentVersion = 'init'
    }

    // kvstore in `${NETLIFY_CACHE_DIR}/${name}.json`
    // we choose to let the user createStore instead of doing it for them
    // bc they may want to set `defaults` and `schema` and `de/serialize`
    const store = new Conf({
      cwd: resolve('cache'),
      configName: 'netlify-plugin-lighthouse',
    })

    // TODO: fetch previous scores from cache
    await execa('lighthouse-ci', site, { stdio: 'inherit' })

    // serialize response
    const curLightHouse = {}
    const prevLightHouse = store.get(`lighthouse.${compareWithVersion}`)
    let totalImprovement = 0
    if (prevLightHouse) {
      console.log(
        `Comparing lighthouse results from version: ${chalk.yellow(compareWithVersion)} to version: ${chalk.yellow(
          currentVersion,
        )}:`,
      )
      Object.entries(curLightHouse).forEach(([k, v]) => {
        const prevV = prevLightHouse[k]
        if (!prevV) return // we should never get here but just in case lighthouse format changes...
        const improvement = v - prevV
        if (improvement < 0) {
          console.log(`- ${chalk.yellow(k)} ${chalk.magenta('regressed')} from ${prevV} to ${v}`)
        } else if (improvement > 0) {
          console.log(`- ${chalk.yellow(k)} ${chalk.green('improved')} from ${prevV} to ${v}`)
        }
        // TODO: print out links to give suggestions on what to do! lets see what lighthouse-ci gives us
        totalImprovement += improvement
      })
      if (Math.abs(totalImprovement) > 2) {
        // some significance bar
        const color = totalImprovement > 0 ? chalk.green : chalk.magenta
        console.log(`${chalk.yellow.bold('Total Improvement')}: ${color(totalImprovement)} points!`)
      }
    } else {
      if (compareWithVersion) {
        console.warn(
          `Warning: you set ${chalk.yellow('compareWithVersion') +
            '=' +
            chalk.yellow(compareWithVersion)} but that version was not found in our result storage.`,
        )
      }
    }
    store.set(`lighthouse.${currentVersion}`, curLightHouse)
    console.log(`Saved results as version: ${chalk.yellow(currentVersion)}`)
  },
}
