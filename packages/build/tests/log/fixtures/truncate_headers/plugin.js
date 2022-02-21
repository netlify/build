export const onPreBuild = function ({ netlifyConfig }) {
  // eslint-disable-next-line no-param-reassign
  netlifyConfig.headers = Array.from({ length: 1e3 }, (value, index) => ({
    for: `/here/${index}`,
    values: { TEST: 'test' },
  }))
}

export const onPostBuild = function ({
  utils: {
    build: { failBuild },
  },
}) {
  failBuild('test')
}
