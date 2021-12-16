import { exit } from 'process'

export default {
  onPreBuild() {
    exit(1)
  },
  onBuild() {
    console.log('test')
  },
}
