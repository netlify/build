// eslint-disable-next-line node/no-missing-require
const avg = require('math-avg')

module.exports = {
  onPreBuild() {
    console.log(avg([1, 2]))
  },
}
