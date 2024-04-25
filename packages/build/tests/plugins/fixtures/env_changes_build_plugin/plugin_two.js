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

  environment.TEST_ONE = ''

  environment.TEST_TWO = 'twoChanged'
}
