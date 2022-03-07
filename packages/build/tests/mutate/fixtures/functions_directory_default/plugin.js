export const onPreBuild = function ({ netlifyConfig, constants: { FUNCTIONS_SRC } }) {
  console.log(FUNCTIONS_SRC)
  // eslint-disable-next-line no-param-reassign
  netlifyConfig.functions.directory = 'test_functions'
}

export const onBuild = function ({ netlifyConfig, constants: { FUNCTIONS_SRC } }) {
  console.log(FUNCTIONS_SRC)
  // eslint-disable-next-line no-param-reassign
  netlifyConfig.functions.directory = ''
}

export const onPostBuild = function ({ constants: { FUNCTIONS_SRC } }) {
  console.log(FUNCTIONS_SRC)
}
