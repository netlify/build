'use strict'

module.exports = {
  onPreBuild({ inputs: { test } }) {
    console.log(test)
  },
}
