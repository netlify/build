export const onPreBuild = function ({ netlifyConfig }) {
  netlifyConfig.headers = [...netlifyConfig.headers, { for: '/path', values: { test: 'two' } }]
}

export const onBuild = function ({ netlifyConfig: { headers } }) {
  console.log(headers)
}
