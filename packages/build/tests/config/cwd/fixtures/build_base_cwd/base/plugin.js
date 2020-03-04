const { cwd } = require('process')

module.exports = {
  name: 'netlify-plugin-test',
  onInit() {
    console.log(cwd(), cwd().endsWith('base'))
  },
}
