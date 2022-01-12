import { env } from 'process'

export const onPreBuild = function () {
  env.TEST_ONE = 'one'
  env.TEST_TWO = 'two'
}

export const onBuild = function () {
  console.log(env.TEST_ONE, env.TEST_TWO, env.LANG)
}

export const onPostBuild = function () {
  console.log(typeof env.TEST_ONE, env.TEST_TWO, env.LANG)
}
