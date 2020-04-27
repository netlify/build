const { stdout, stderr } = require('process')

// Start streaming Bash command or plugin command output
const pipeOutput = function(childProcess) {
  childProcess.stdout.pipe(stdout)
  childProcess.stderr.pipe(stderr)
}

// Stop streaming/buffering Bash command or plugin command output
const unpipeOutput = function(childProcess) {
  childProcess.stdout.unpipe(stdout)
  childProcess.stderr.unpipe(stderr)
}

module.exports = { pipeOutput, unpipeOutput }
