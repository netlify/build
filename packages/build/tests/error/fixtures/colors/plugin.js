import chalk from 'chalk'

export default {
  onPreBuild() {
    throw new Error(chalk.red('ColorTest'))
  },
}
