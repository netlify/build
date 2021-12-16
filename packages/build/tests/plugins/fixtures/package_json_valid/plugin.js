export default {
  onPreBuild({ packageJson: { name } }) {
    console.log(name)
  },
}
