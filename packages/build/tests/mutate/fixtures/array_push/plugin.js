export const onPreBuild = function ({ netlifyConfig }) {
  netlifyConfig.functions['*'].included_files.push('two')
}
