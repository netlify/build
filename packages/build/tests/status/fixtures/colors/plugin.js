import chalk from 'chalk'

export default {
  onBuild({
    utils: {
      status: { show },
    },
  }) {
    show({ summary: chalk.red('summary') })
  },
}
