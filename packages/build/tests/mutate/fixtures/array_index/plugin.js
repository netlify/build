export const onPreBuild = function ({ netlifyConfig }) {
  netlifyConfig.functions['*'].included_files[1] = 'two'
}
