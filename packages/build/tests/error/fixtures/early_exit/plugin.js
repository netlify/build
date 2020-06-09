const { exit } = require('process')

module.exports = {
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
