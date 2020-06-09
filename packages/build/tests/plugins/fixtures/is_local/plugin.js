module.exports = {
  onPreBuild({ constants: { IS_LOCAL } }) {
    console.log(IS_LOCAL)
  },
}
