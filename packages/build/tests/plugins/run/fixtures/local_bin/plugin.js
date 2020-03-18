const execa = require('execa')

module.exports = {
  async onInit() {
    await execa('atob', ['dGVzdA=='], { stdio: 'inherit' })
  },
}
