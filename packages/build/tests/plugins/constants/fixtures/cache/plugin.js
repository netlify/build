const { resolve } = require('path')

module.exports = {
  name: 'netlify-plugin-test',
  init({ constants: { CACHE_DIR } }) {
    console.log(CACHE_DIR, CACHE_DIR === resolve(`${__dirname}/.netlify/cache`))
  },
}
