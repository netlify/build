import { env } from 'process'

const showArg = env.SHOW_ARG === '""' ? undefined : JSON.parse(env.SHOW_ARG)

export const onPreBuild = function ({
  utils: {
    status: { show },
  },
}) {
  show(showArg)
}
