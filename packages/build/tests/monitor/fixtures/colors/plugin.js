import * as colors from 'ansis'

export const onPreBuild = function () {
  throw new Error(colors.red('ColorTest'))
}
