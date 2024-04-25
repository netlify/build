export const onPreBuild = function ({ netlifyConfig }) {
  netlifyConfig.functions.directory = 'test_functions'
}

export const onBuild = function ({ constants: { FUNCTIONS_SRC } }) {
  console.log(FUNCTIONS_SRC)
}
