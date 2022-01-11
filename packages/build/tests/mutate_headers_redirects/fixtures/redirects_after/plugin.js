export const onPreBuild = function ({ netlifyConfig }) {
  // eslint-disable-next-line no-param-reassign
  netlifyConfig.redirects = [...netlifyConfig.redirects, { from: '/three', to: '/four' }]
}

export const onBuild = function ({ netlifyConfig: { redirects } }) {
  console.log(redirects)
}
