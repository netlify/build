'use strict'

module.exports = {
  onPreBuild({ constants: { CONFIG_PATH } }) {
    console.log(CONFIG_PATH)
  },
}
