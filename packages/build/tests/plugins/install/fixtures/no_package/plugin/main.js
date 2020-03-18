// eslint-disable-next-line node/no-missing-require
const avg = require('math-avg')

module.exports = {
  onInit() {
    console.log(avg([1, 2]))
  },
}
