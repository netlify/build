const { stdout, stderr } = require('process')

// Start streaming command or plugin hook output
const pipeOutput = function(childProcess) {
  childProcess.stdout.pipe(stdout)
  childProcess.stderr.pipe(stderr)
}

// Stop streaming command or plugin hook output
const unpipeOutput = function(childProcess) {
  childProcess.stdout.unpipe(stdout)
  childProcess.stderr.unpipe(stderr)
}

module.exports = { pipeOutput, unpipeOutput }
