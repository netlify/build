'use strict'

module.exports = {
  onPreBuild({ packageJson: { name } }) {
    console.log(name === undefined)
  },
}
