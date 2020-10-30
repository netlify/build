'use strict'

module.exports = {
  onPreBuild({
    utils: {
      status: { show },
    },
  }) {
    show({ title: 'title', summary: 'summary', text: 'text' })
  },
}
