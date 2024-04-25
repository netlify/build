export const onPreBuild = function ({ netlifyConfig }) {
  netlifyConfig.build.ignore = ''
}
