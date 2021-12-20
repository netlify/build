export default {
  onPreBuild({ utils }) {
    console.log(Object.keys(utils).sort().join(' '))
  },
}
