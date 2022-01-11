import { exit } from 'process'

export const onPreBuild = function () {
  exit(1)
}

export const onBuild = function () {
  console.log('test')
}
