import { exit } from 'process'

export const onPreBuild = function () {
  exit()
}

export const onBuild = function () {}
