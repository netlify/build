'use strict'

module.exports = {
  onSuccess() {
    throw new Error('test')
  },
}
