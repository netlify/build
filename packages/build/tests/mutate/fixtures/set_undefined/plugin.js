export const onPreBuild = function ({ netlifyConfig }) {
  netlifyConfig.build.command = undefined
}
