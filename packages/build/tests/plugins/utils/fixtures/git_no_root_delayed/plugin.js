module.exports = {
  onPreBuild({ utils: { git } }) {
    console.log(typeof git)
  },
}
