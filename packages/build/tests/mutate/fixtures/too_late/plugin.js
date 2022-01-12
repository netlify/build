export const onBuild = function ({ netlifyConfig: { build } }) {
  // eslint-disable-next-line no-param-reassign
  build.command = 'node --version'
}
