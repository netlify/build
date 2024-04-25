export const onPreBuild = function ({ netlifyConfig }) {
  netlifyConfig.functions.test = {}

  netlifyConfig.functions.test.included_files = []

  netlifyConfig.functions.test = { included_files: [] }
}
