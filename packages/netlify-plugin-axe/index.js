const execa = require('execa')
const mkdirp = require('mkdirp')

function netlifyAxePlugin(conf /* createStore */) {
  let { axeFlags } = conf
  return {
    init: async () => {
      mkdirp.sync(`.axe-results/`)
      await execa('chmod', ['-R', '+rw', `.axe-results`])
    },
    /* Run axe on post deploy */
    deployEnd: async () => {
      const site = conf.site || process.env.SITE

      await execa(`axe ${site} ${axeFlags} --save .axe-results/result.json`, {
        stdio: 'inherit',
        preferLocal: true
      })

      let results = require(`${process.cwd()}/.axe-results/result.json`)
      if (results && results[0]) {
        results = results[0].violations
      }
      console.log({ violations: results })
    }
  }
}

module.exports = netlifyAxePlugin
