export const onPreBuild = function ({ netlifyConfig: { build } }) {
  build.command = ''
}
