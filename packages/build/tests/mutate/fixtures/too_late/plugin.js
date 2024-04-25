export const onBuild = function ({ netlifyConfig: { build } }) {
  build.command = 'node --version'
}
