export default {
  onPreBuild({ netlifyConfig: { build } }) {
    // eslint-disable-next-line no-param-reassign
    build.command = 'node --version'
  },
}
