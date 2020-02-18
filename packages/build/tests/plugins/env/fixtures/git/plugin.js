const {
  env: { BRANCH, HEAD, COMMIT_REF, CACHED_COMMIT_REF },
} = require('process')

module.exports = {
  name: 'netlify-plugin-test',
  onInit() {
    console.log(Boolean(BRANCH))
    console.log(Boolean(HEAD))
    console.log(Boolean(COMMIT_REF))
    console.log(Boolean(CACHED_COMMIT_REF))
  },
}
