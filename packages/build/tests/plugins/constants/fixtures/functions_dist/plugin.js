const { resolve } = require('path')

module.exports = {
  name: 'netlify-plugin-test',
  init({ constants: { FUNCTIONS_DIST } }) {
    console.log(FUNCTIONS_DIST, FUNCTIONS_DIST === resolve(`${__dirname}/.netlify/functions`))
  },
}
