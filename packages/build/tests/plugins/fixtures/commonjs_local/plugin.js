module.exports = {
  onPreBuild() {
    console.log(typeof __dirname === 'string')
  },
}
