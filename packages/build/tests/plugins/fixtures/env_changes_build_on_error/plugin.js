import { env } from 'process'

export const onPreBuild = function ({
  netlifyConfig: {
    build: { environment },
  },
}) {
  environment.TEST_ONE = 'one'
}

export const onBuild = function () {
  console.log(env.TEST_ONE)
  throw new Error('onBuild')
}

export const onError = function () {
  console.log(env.TEST_ONE)
}

export const onEnd = function () {
  console.log(env.TEST_ONE)
}
