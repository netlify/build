export const onPreBuild = function ({ netlifyConfig }) {
  netlifyConfig.redirects = Array.from({ length: 1e3 }, (value, index) => ({
    from: `/here/${index}`,
    to: '/there',
    query: { test: index },
  }))
}

export const onPostBuild = function ({
  utils: {
    build: { failBuild },
  },
}) {
  failBuild('test')
}
