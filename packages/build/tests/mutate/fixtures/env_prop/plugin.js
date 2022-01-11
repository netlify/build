export const onPreBuild = function ({ netlifyConfig }) {
  // eslint-disable-next-line no-param-reassign
  netlifyConfig.build.environment.TEST_TWO = 'two'
}

export const onBuild = function ({
  netlifyConfig: {
    build: { environment },
  },
}) {
  console.log(environment)
}
