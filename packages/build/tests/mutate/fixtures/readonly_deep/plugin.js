export const onPreBuild = function ({ netlifyConfig }) {
  netlifyConfig.plugins[0].inputs.example = true
}
