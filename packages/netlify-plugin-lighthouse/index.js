const execa = require('execa')
const path = require('path')

function netlifyLighthousePlugin(conf) {
  return {
    // Hook into lifecycle
    postdeploy: async () => {
      const lighthouseCI = path.join(__dirname, 'node_modules', '.bin', 'lighthouse-ci')
      let resp
      try {
        const subprocess = execa(lighthouseCI, ['https://netlify.com'], {
          shell: true
        })
        subprocess.stderr.pipe(process.stderr)
        subprocess.stdout.pipe(process.stdout)
        resp = await subprocess
      } catch (err) {
        console.log(err)
      }
      // console.log(resp.stdout)
    }
  }
}

module.exports = netlifyLighthousePlugin
