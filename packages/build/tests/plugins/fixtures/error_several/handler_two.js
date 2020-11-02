'use strict'

module.exports = {
  onError({ error: { message } }) {
    console.log(message)
  },
}
