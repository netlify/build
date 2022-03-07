import chalk from 'chalk'

export const onBuild = function ({
  utils: {
    status: { show },
  },
}) {
  show({ summary: chalk.red('summary') })
}
