export const onPreBuild = function ({ netlifyConfig }) {
  netlifyConfig.build.environment.TEST_TWO = 'two'
}

export const onBuild = function ({
  netlifyConfig: {
    build: { environment },
  },
}) {
  console.log(environment)
}
