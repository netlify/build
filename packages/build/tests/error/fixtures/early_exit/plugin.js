module.exports = {
  onPreBuild() {
    process.env.TEST_PID = process.pid
  },
  onPostBuild() {},
}
