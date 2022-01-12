export const onPreBuild = function ({ netlifyConfig }) {
  // eslint-disable-next-line no-param-reassign
  netlifyConfig.build.functions = 'test_functions'
}

export const onBuild = function ({ netlifyConfig }) {
  console.log(netlifyConfig.functionsDirectory)
}
