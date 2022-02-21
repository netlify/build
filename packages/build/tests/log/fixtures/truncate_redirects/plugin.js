export const onPreBuild = function ({ netlifyConfig }) {
  // eslint-disable-next-line no-param-reassign
  netlifyConfig.redirects = Array.from({ length: 1e3 }, (value, index) => ({
    from: `/here/${index}`,
    to: '/there',
  }))
}

export const onPostBuild = function ({
  utils: {
    build: { failBuild },
  },
}) {
  failBuild('test')
}
