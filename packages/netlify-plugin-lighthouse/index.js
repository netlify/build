const execa = require('execa')
const path = require('path')
const chalk = require('chalk')

function netlifyLighthousePlugin(conf, createStore) {
  const store = createStore()
  let { 
    enabled,  // currently unused
    currentVersion,  // users will be tempted to use semver, but we really don't care
    compareWithVersion 
  } =  conf
  if (typeof currentVersion === `undefined`) {
    console.log(`lighthouseplugin version not specified, auto assigning ${chalk.yellow("currentVersion='init'")}`)
    currentVersion = 'init'
  }
  if (typeof compareWithVersion === `undefined`) compareWithVersion = 'init' // will just come up undefined if doesn't exist
  return {
    /* Run lighthouse on post deploy */
    postdeploy: async () => {
      const site = conf.site || process.env.SITE
      /* TODO fetch previous scores from cache */
      const lighthouseCI = path.join(__dirname, 'node_modules', '.bin', 'lighthouse-ci')
      let resp
      try {
        const subprocess = execa(lighthouseCI, [site], {
          shell: true
        })
        subprocess.stderr.pipe(process.stderr)
        subprocess.stdout.pipe(process.stdout)
        resp = await subprocess
      } catch (err) {
        console.log(err)
      }
      // console.log(resp.stdout)

      if (resp.exitCodeName === 'SUCCESS') {
        // serialize response
        let arr = resp.stdout.split('\n')
        const curLightHouse = {}
        arr = arr.slice(0, arr.length-2).forEach(key => {
          const [k, v] = key.split(': ')
          curLightHouse[k] = Number(v)
        })
        const prevLightHouse = store.get(`lighthouse.${compareWithVersion}`)
        let totalImprovement = 0
        if (prevLightHouse) {
          console.log(`Comparing lighthouse results from version: ${chalk.yellow(compareWithVersion)} to version: ${chalk.yellow(currentVersion)}:`)
          Object.entries(curLightHouse).forEach(([k,v]) => {
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
          if (Math.abs(totalImprovement) > 2) { // some significance bar
            const color = totalImprovement > 0 ? chalk.green : chalk.magenta 
            console.log(`${chalk.yellow.bold("Total Improvement")}: ${color(totalImprovement)} points!`)
          }
        } else {
          if (compareWithVersion) {
            console.warn(`Warning: you set ${
              chalk.yellow('compareWithVersion') + '=' + chalk.yellow(compareWithVersion)
            } but that version was not found in our result storage.`)
          }
        }
        store.set(`lighthouse.${currentVersion}`, curLightHouse)
        console.log(`Saved results as version: ${chalk.yellow(currentVersion)}`)
      }
    }
  }
}

module.exports = netlifyLighthousePlugin
