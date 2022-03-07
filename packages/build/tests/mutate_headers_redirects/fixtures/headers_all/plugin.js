export const onPreBuild = function ({ netlifyConfig }) {
  // eslint-disable-next-line no-param-reassign
  netlifyConfig.headers = [...netlifyConfig.headers, { for: '/path', values: { test: 'two' } }]
}

export const onBuild = function ({ netlifyConfig: { headers } }) {
  console.log(headers)
}
