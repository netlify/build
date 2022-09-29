export const onPreBuild = function ({ netlifyConfig }) {
  delete netlifyConfig.build.command
}
