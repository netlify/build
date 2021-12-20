import chalk from 'chalk'

export default {
  onPreBuild() {
    console.log(chalk.red('onPreBuild'))
  },
}
