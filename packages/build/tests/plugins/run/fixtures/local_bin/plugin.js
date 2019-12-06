const execa = require('execa')

module.exports = {
  name: 'netlify-plugin-test',
  async onInit() {
    await execa('atob', ['dGVzdA=='], { stdio: 'inherit' })
  },
}
