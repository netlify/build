const { resolve } = require('path')

module.exports = {
  name: 'netlify-plugin-test',
  init({ constants: { CONFIG_PATH } }) {
    console.log(CONFIG_PATH, CONFIG_PATH === resolve(`${__dirname}/netlify.yml`))
  },
}
