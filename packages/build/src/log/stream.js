const { stdout, stderr } = require('process')

const isNetlifyCI = require('../utils/is-netlify-ci')
// Start streaming command or plugin hook output
// In CI, we need to buffer output instead at the moment due to the current
// BuildBot not handling it correctly.
// But locally we want to stream output instead for a better developer
// experience.
// See https://github.com/netlify/build/issues/343
const startOutput = function(childProcess, chunks) {
  if (shouldBuffer()) {
    bufferOutput(childProcess, chunks)
    return
  }

  pipeOutput(childProcess)
}

// Stop streaming/buffering command or plugin hook output
const stopOutput = function(childProcess, chunks) {
  if (shouldBuffer()) {
    unbufferOutput(chunks)
    return
  }

  unpipeOutput(childProcess)
}

const pipeOutput = function(childProcess) {
  childProcess.stdout.pipe(stdout)
  childProcess.stderr.pipe(stderr)
}

const unpipeOutput = function(childProcess) {
  childProcess.stdout.unpipe(stdout)
  childProcess.stderr.unpipe(stderr)
}

const bufferOutput = function(childProcess, chunks) {
  childProcess.stdout.on('data', chunk => {
    chunks.push(chunk)
  })
  childProcess.stderr.on('data', chunk => {
    chunks.push(chunk)
  })
}

const unbufferOutput = function(chunks) {
  const output = chunks.join('')
  process.stdout.write(output)
}

const shouldBuffer = function() {
  return isNetlifyCI()
}

module.exports = { startOutput, stopOutput }
