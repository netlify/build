export default {
  onPreBuild({ netlifyConfig }) {
    // eslint-disable-next-line no-param-reassign
    netlifyConfig.build.environment = { ...netlifyConfig.build.environment, TEST_TWO: 'two' }
  },
  onBuild({
    netlifyConfig: {
      build: { environment },
    },
  }) {
    console.log(environment)
  },
}
