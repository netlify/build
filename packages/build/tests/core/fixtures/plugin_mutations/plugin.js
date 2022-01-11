export const onPreBuild = function ({ netlifyConfig }) {
  // eslint-disable-next-line no-param-reassign
  netlifyConfig.redirects = [{ from: 'api/*', to: '.netlify/functions/:splat', status: 200 }]
}
