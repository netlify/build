import { env } from 'process'

export const onPreBuild = function ({
  netlifyConfig: {
    build: { environment },
  },
}) {
  // eslint-disable-next-line no-param-reassign
  environment.TEST_ONE = 'one'
  // eslint-disable-next-line no-param-reassign
  environment.TEST_TWO = 'two'
}

export const onBuild = function () {
  console.log(env.TEST_ONE, env.TEST_TWO, env.LANG)
}

export const onPostBuild = function () {
  console.log(env.TEST_ONE, env.TEST_TWO, env.LANG)
}
