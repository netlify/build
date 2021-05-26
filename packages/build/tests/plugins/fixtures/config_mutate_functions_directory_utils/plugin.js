'use strict'

module.exports = {
  onPreBuild({ netlifyConfig }) {
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.functionsDirectory = 'test_functions'
  },
  async onBuild({
    utils: {
      functions: { list },
    },
  }) {
    const functions = await list()
    const names = functions.map(({ name }) => name).join(' ')
    console.log(names)
  },
}
