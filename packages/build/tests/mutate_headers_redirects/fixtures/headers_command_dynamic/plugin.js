export const onPreBuild = function ({ netlifyConfig: { headers, build } }) {
  console.log(headers)

  build.publish = 'test'
}

export const onBuild = function ({ netlifyConfig: { headers } }) {
  console.log(headers)
}
