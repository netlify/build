export const onPreBuild = function ({ netlifyConfig }) {
  console.log('onPreBuild:', netlifyConfig)
}

export const onBuild = function ({ netlifyConfig }) {
  console.log('onBuild:', netlifyConfig)
}