export const onPreBuild = function ({ netlifyConfig: { redirects } }) {
  console.log(redirects)
}

export const onBuild = function ({ netlifyConfig: { redirects } }) {
  console.log(redirects)
}
