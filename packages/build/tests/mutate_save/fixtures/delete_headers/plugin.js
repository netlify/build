export default {
  onPreBuild({ netlifyConfig }) {
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.build.environment.TEST = 'test'
  },
}
