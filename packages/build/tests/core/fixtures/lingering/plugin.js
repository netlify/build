const { spawn } = require('child_process')

module.exports = {
  onPreBuild() {
    const { pid } = spawn('node', [`${__dirname}/forever.js`], { detached: true, stdio: 'ignore' })
    console.log(`PID: ${pid}`)
  },
}
