export const onPreBuild = function ({ netlifyConfig }) {
  netlifyConfig.redirects = [...netlifyConfig.redirects, { from: '/three', to: '/four' }]
}

export const onBuild = function ({ netlifyConfig: { redirects } }) {
  console.log(redirects)
}
