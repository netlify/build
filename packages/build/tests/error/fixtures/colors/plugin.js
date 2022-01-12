import chalk from 'chalk'

export const onPreBuild = function () {
  throw new Error(chalk.red('ColorTest'))
}
