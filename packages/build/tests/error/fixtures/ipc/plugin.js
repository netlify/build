import { exit } from 'process'

export default {
  onPreBuild() {
    exit()
  },
  onBuild() {},
}
