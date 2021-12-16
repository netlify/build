import { env } from 'process'

export default {
  onPreBuild() {
    console.log(env.CONTEXT)
  },
}
