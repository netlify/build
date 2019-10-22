const execa = require('execa')

module.exports = {
  name: 'netlify-plugin-test',
  async init() {
    await execa('atob', ['dGVzdA=='], { stdio: 'inherit' })
  },
}
