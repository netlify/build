const avg = require('math-avg')

module.exports = {
  onPreBuild() {
    console.log(avg([1, 2]))
  },
}
