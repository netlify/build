export const onPreBuild = function ({ netlifyConfig }) {
  netlifyConfig.headers = [...netlifyConfig.headers, { for: '/path', values: { test: 'two' } }]
}

export const onPostBuild = function ({ netlifyConfig: { headers } }) {
  console.log(headers)
}
