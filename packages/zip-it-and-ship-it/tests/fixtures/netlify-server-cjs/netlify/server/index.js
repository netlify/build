const { version } = require('./helpers/meta.js')

module.exports = {
  async fetch() {
    return new Response(`hello from the server ${version}`)
  },
}
