const execa = require('execa')

module.exports = {
  async init() {
    await execa('atob', ['dGVzdA=='], { stdio: 'inherit' })
  },
}
