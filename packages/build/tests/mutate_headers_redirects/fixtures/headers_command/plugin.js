export const onPreBuild = function ({ netlifyConfig: { headers } }) {
  console.log(headers)
}

export const onBuild = function ({ netlifyConfig: { headers } }) {
  console.log(headers)
}
