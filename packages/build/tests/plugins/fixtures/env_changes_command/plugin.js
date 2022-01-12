import { env } from 'process'

export const onPreBuild = function () {
  env.TEST_ONE = 'one'
  env.TEST_TWO = 'two'
  delete env.LANGUAGE
}
