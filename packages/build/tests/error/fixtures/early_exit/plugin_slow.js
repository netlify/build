module.exports = {
  onBuild() {
    process.kill(process.env.TEST_PID)
  },
}
