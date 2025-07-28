import * as colors from 'ansis'

export const onBuild = function ({
  utils: {
    status: { show },
  },
}) {
  show({ summary: colors.red('summary') })
}
