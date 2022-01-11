export const onPreBuild = function ({ netlifyConfig, constants: { PUBLISH_DIR } }) {
  console.log(PUBLISH_DIR)
  // eslint-disable-next-line no-param-reassign
  netlifyConfig.build.publish = 'test'
}

export const onBuild = function ({ constants: { PUBLISH_DIR } }) {
  console.log(PUBLISH_DIR)
}
