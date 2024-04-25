export const onPreBuild = function ({ netlifyConfig }) {
  console.log(netlifyConfig.functionsDirectory)

  netlifyConfig.functions.directory = ''
}
