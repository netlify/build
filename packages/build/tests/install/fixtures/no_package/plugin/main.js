import avg from 'math-avg'

export default {
  onPreBuild() {
    console.log(avg([1, 2]))
  },
}
