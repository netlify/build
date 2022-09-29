export const onPreBuild = function ({ netlifyConfig }) {
  netlifyConfig.build.functions = 'test_functions'
}

export const onBuild = function ({ netlifyConfig }) {
  console.log(netlifyConfig.functionsDirectory)
}
