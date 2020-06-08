const { stdout, stderr } = require('process')
const { promisify } = require('util')

const pSetTimeout = promisify(setTimeout)

// Start streaming Bash command or plugin command output
const pipeOutput = function(childProcess) {
  childProcess.stdout.pipe(stdout)
  childProcess.stderr.pipe(stderr)
}

// Stop streaming/buffering Bash command or plugin command output
const unpipeOutput = async function(childProcess) {
  // Let `childProcess` `stdout` and `stderr` flush before stopping redirecting
  await pSetTimeout(0)

  childProcess.stdout.unpipe(stdout)
  childProcess.stderr.unpipe(stderr)
}

module.exports = { pipeOutput, unpipeOutput }
