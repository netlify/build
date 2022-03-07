import chalk from 'chalk'

export const onPreBuild = function () {
  console.log(chalk.red('onPreBuild'))
}
