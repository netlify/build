'use strict'

const {
  env: { DEPLOY_ID },
} = require('process')

module.exports = {
  onPreBuild() {
    console.log(DEPLOY_ID)
  },
}
