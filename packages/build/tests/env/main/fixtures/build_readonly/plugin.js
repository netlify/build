const {
  env: { NETLIFY },
} = require('process')

module.exports = {
  onInit() {
    console.log(NETLIFY === undefined)
  },
}
