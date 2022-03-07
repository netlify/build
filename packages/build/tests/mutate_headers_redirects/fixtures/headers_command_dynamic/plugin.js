export const onPreBuild = function ({ netlifyConfig: { headers, build } }) {
  console.log(headers)
  // eslint-disable-next-line no-param-reassign
  build.publish = 'test'
}

export const onBuild = function ({ netlifyConfig: { headers } }) {
  console.log(headers)
}
