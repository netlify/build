import { env } from 'process'

export const onPreBuild = function ({
  netlifyConfig: {
    build: { environment },
  },
}) {
  environment.TEST_ONE = 'one_environment'
  env.TEST_ONE = 'one_env'

  environment.TEST_TWO = 'two'
  env.LANGUAGE = ''
}

export const onBuild = function () {
  console.log(env.TEST_ONE, env.TEST_TWO, env.LANGUAGE)
}
