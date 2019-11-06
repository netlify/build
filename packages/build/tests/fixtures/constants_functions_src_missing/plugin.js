const { resolve } = require('path')

const pathExists = require('path-exists')

module.exports = {
  name: 'netlify-plugin-test',
  async init({ constants: { FUNCTIONS_SRC } }) {
    console.log(
      FUNCTIONS_SRC,
      FUNCTIONS_SRC === resolve(`${__dirname}/missing`),
      await pathExists(`${__dirname}/missing`),
    )
  },
}
