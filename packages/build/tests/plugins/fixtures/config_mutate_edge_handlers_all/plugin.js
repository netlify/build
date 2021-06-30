'use strict'

module.exports = {
  onPreBuild({ netlifyConfig }) {
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.edge_handlers = [{ path: '/two', handler: 'two' }]
  },
  onBuild({ netlifyConfig }) {
    console.log(netlifyConfig.edge_handlers)
  },
}
