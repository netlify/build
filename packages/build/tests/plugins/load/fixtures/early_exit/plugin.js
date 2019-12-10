const { exit } = require('process')

module.exports = {
  name: 'netlify-plugin-test',
  onPreBuild() {
    console.log('onPreBuild')
    setTimeout(() => {
      exit()
    }, 0)
  },
  onPostBuild() {
    console.log('onPostBuild')
  },
}
