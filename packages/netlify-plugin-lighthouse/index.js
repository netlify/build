const execa = require('execa')
const path = require('path')

function netlifyLighthousePlugin(conf) {
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

      /* TODO save scores and diff between builds */
    }
  }
}

module.exports = netlifyLighthousePlugin
