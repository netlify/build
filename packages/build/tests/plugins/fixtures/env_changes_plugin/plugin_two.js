import { env } from 'process'

export const onPreBuild = function () {
  console.log(env.TEST_ONE, env.TEST_TWO, env.LANG)
}

export const onBuild = function () {
  console.log(env.TEST_ONE, env.TEST_TWO, env.LANG)

  delete env.TEST_ONE
  env.TEST_TWO = 'twoChanged'
}
