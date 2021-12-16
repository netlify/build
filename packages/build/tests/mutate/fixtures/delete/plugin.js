export default {
  onPreBuild({ netlifyConfig }) {
    // eslint-disable-next-line no-param-reassign
    delete netlifyConfig.build.command
  },
}
