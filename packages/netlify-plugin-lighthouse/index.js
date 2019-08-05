const execa = require('execa')
const path = require('path')
const chalk = require('chalk')

function netlifyLighthousePlugin(conf, createStore) {
  const store = createStore()
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
        const prevLightHouse = store.get('lighthouse')
        let totalImprovement = 0
        if (prevLightHouse) {
          Object.entries(curLightHouse).forEach(([k,v]) => {
            const prevV = prevLightHouse[k]
            const improvement = v - prevV
            if (improvement < 0) {
              console.log(`${chalk.yellow(k)} ${chalk.magenta('regressed')} from ${prevV} to ${v}`)
            } else if (improvement > 0) {
              console.log(`${chalk.yellow(k)} ${chalk.green('improved')} from ${prevV} to ${v}`)
            }
            totalImprovement += improvement
          })
          console.log(`Total Improvement: ${totalImprovement} points!`)
        }
        store.set('lighthouse', curLightHouse)
      }

      /* TODO save scores and diff between builds */
    }
  }
}

module.exports = netlifyLighthousePlugin
