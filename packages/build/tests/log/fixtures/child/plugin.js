import * as colors from 'ansis'

export const onPreBuild = function () {
  console.log(colors.red('onPreBuild'))
}
