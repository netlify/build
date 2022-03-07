export const onPreBuild = function ({ netlifyConfig }) {
  // eslint-disable-next-line no-param-reassign
  netlifyConfig.functions.test = {}
  // eslint-disable-next-line no-param-reassign
  netlifyConfig.functions.test.included_files = []
  // eslint-disable-next-line no-param-reassign
  netlifyConfig.functions.test = { included_files: [] }
}
