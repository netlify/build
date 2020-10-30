'use strict'

module.exports = {
  onPreBuild({ constants: { SITE_ID } }) {
    console.log(SITE_ID)
  },
}
