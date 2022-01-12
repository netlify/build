export const onPreBuild = function ({ netlifyConfig: { build } }) {
  // eslint-disable-next-line no-param-reassign
  build.command = 'node --version'
}
