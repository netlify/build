export const onPreBuild = function ({ netlifyConfig }) {
  netlifyConfig.functions.directory = 'test_functions'
}

export const onBuild = function ({ netlifyConfig }) {
  console.log(netlifyConfig.functionsDirectory)
}
