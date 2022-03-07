import { env } from 'process'

export const onPreBuild = function ({
  netlifyConfig: {
    build: { environment },
  },
}) {
  // eslint-disable-next-line no-param-reassign
  environment.TEST_ONE = 'one_environment'
  env.TEST_ONE = 'one_env'
  // eslint-disable-next-line no-param-reassign
  environment.TEST_TWO = 'two'
  env.LANGUAGE = ''
}

export const onBuild = function () {
  console.log(env.TEST_ONE, env.TEST_TWO, env.LANGUAGE)
}
