export const onPreBuild = function ({
  netlifyConfig: {
    build: { environment },
  },
}) {
  environment.TEST_ONE = 'one'

  environment.TEST_TWO = 'two'

  environment.LANGUAGE = ''
}
