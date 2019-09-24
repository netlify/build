const path = require('path')

const execa = require('execa')
const chalk = require('chalk')
const mkdirp = require('mkdirp')

function netlifyAxePlugin(conf /* createStore */) {
  let {
    enabled, // currently unused
    axeFlags
  } = conf
  return {
    init: async () => {
      mkdirp.sync(`.axe-results/`)
      await execa('chmod', ['-R', '+rw', `.axe-results`])
    },
    /* Run axe on post deploy */
    postdeploy: async () => {
      const site = conf.site || process.env.SITE
      /* TODO fetch previous scores from cache */
      const axeCLI = path.join(__dirname, 'node_modules', '.bin', 'axe')
      let resp
      try {
        const subprocess = execa(axeCLI, [site, axeFlags, `--save .axe-results/result.json`], {
          shell: true
        })
        subprocess.stderr.pipe(process.stderr)
        subprocess.stdout.pipe(process.stdout)
        resp = await subprocess
      } catch (err) {
        console.log(err)
      }
      // console.log({resp})

      if (resp && resp.exitCodeName === 'SUCCESS') {
        let results = require(`${process.cwd()}/.axe-results/result.json`)
        if (results && results[0]) {
          results = results[0].violations
        }
        console.log({ violations: results })
      }
    }
  }
}

module.exports = netlifyAxePlugin
