export const onPreBuild = function ({ netlifyConfig }) {
  console.log(netlifyConfig.functionsDirectory)
  // eslint-disable-next-line no-param-reassign
  netlifyConfig.functions.directory = ''
}
