import { env } from 'process'

const showArg = env.SHOW_ARG === '""' ? undefined : JSON.parse(env.SHOW_ARG)

export default {
  onPreBuild({
    utils: {
      status: { show },
    },
  }) {
    show(showArg)
  },
}
