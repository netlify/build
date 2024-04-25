export const onPreBuild = function ({ netlifyConfig }) {
  netlifyConfig.functions.directory = 'test_functions'
}
