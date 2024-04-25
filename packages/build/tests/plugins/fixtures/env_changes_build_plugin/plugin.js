import { env } from 'process'

export const onPreBuild = function ({
  netlifyConfig: {
    build: { environment },
  },
}) {
  environment.TEST_ONE = 'one'

  environment.TEST_TWO = 'two'
}

export const onBuild = function () {
  console.log(env.TEST_ONE, env.TEST_TWO, env.LANG)
}

export const onPostBuild = function () {
  console.log(env.TEST_ONE, env.TEST_TWO, env.LANG)
}
