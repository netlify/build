const execa = require('execa')

module.exports = {
  async onPreBuild() {
    await execa('atob', ['dGVzdA=='], { stdio: 'inherit' })
  },
}
