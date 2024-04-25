export const onPreBuild = function ({ netlifyConfig }) {
  netlifyConfig.redirects = Array.from({ length: 1e3 }, (value, index) => ({
    from: `/here/${index}`,
    to: '/there',
  }))
}

export const onSuccess = function ({ netlifyConfig }) {
  console.log(netlifyConfig.redirects.length)
}
