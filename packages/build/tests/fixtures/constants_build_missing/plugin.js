const { resolve } = require('path')

const pathExists = require('path-exists')

module.exports = {
  name: 'netlify-plugin-test',
  async init({ constants: { BUILD_DIR } }) {
    console.log(BUILD_DIR, BUILD_DIR === resolve(`${__dirname}/publish`), await pathExists(`${__dirname}/publish`))
  },
}
