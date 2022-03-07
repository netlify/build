export const onPreBuild = function ({ netlifyConfig }) {
  netlifyConfig.headers.push({ values: {} })
}

export const onBuild = function ({ netlifyConfig: { headers } }) {
  console.log(headers)
}
