import { env, pid } from 'process'

export const onPreBuild = function () {
  env.TEST_PID = pid
}

export const onPostBuild = function () {}
