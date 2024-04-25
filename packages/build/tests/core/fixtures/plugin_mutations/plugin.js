export const onPreBuild = function ({ netlifyConfig }) {
  netlifyConfig.redirects = [{ from: 'api/*', to: '.netlify/functions/:splat', status: 200 }]
}
