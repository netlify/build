'use strict'

module.exports = {
  onPreBuild({ constants: { NETLIFY_API_TOKEN = 'none' } }) {
    console.log(NETLIFY_API_TOKEN)
  },
}
