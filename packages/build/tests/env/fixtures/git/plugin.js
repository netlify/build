'use strict'

const {
  env: { BRANCH, HEAD, COMMIT_REF, CACHED_COMMIT_REF, PULL_REQUEST },
} = require('process')

module.exports = {
  onPreBuild() {
    console.log(Boolean(BRANCH))
    console.log(Boolean(HEAD))
    console.log(Boolean(COMMIT_REF))
    console.log(Boolean(CACHED_COMMIT_REF))
    console.log(PULL_REQUEST)
  },
}
