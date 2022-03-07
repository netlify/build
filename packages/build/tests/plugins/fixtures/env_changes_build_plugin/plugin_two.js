import { env } from 'process'

export const onPreBuild = function () {
  console.log(env.TEST_ONE, env.TEST_TWO, env.LANG)
}

export const onBuild = function ({
  netlifyConfig: {
    build: { environment },
  },
}) {
  console.log(env.TEST_ONE, env.TEST_TWO, env.LANG)

  // eslint-disable-next-line no-param-reassign
  environment.TEST_ONE = ''
  // eslint-disable-next-line no-param-reassign
  environment.TEST_TWO = 'twoChanged'
}
