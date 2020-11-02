'use strict'

module.exports = {
  onPreBuild({ inputs: { one } }) {
    console.log(one)
  },
}
