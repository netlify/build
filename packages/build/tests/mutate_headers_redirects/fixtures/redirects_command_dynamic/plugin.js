export const onPreBuild = function ({ netlifyConfig: { redirects, build } }) {
  console.log(redirects)

  build.publish = 'test'
}

export const onBuild = function ({ netlifyConfig: { redirects } }) {
  console.log(redirects)
}
