export const onPreBuild = function ({ netlifyConfig: { redirects, build } }) {
  console.log(redirects)
  // eslint-disable-next-line no-param-reassign
  build.publish = 'test'
}

export const onBuild = function ({ netlifyConfig: { redirects } }) {
  console.log(redirects)
}
