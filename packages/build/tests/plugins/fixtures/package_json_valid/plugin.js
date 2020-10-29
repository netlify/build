module.exports = {
  onPreBuild({ packageJson: { name } }) {
    console.log(name)
  },
}
