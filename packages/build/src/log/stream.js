const { stdout, stderr } = require('process')
const { promisify } = require('util')

const pSetTimeout = promisify(setTimeout)

const isNetlifyCI = require('../utils/is-netlify-ci')
// Start streaming Bash command or plugin command output
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

// Stop streaming/buffering Bash command or plugin command output
const stopOutput = async function(childProcess, chunks) {
  if (shouldBuffer()) {
    unbufferOutput(chunks)
    return
  }

  await unpipeOutput(childProcess)
}

const pipeOutput = function(childProcess) {
  childProcess.stdout.pipe(stdout)
  childProcess.stderr.pipe(stderr)
}

const unpipeOutput = async function(childProcess) {
  await Promise.all([waitForFlush(childProcess.stdout), waitForFlush(childProcess.stderr)])

  childProcess.stdout.unpipe(stdout)
  childProcess.stderr.unpipe(stderr)
}

// childProcess.stdout|stderr might have some writes not piped|written to
// parent process.stdout|stderr yet.
// TODO: find a more reliable way
const waitForFlush = async function(stream) {
  // istanbul ignore next
  while (stream._readableState.paused) {
    await pSetTimeout(1e3)
    stream.resume()
  }

  await pSetTimeout(0)
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
  process.stdout.write(`${output}\n`)
}

const shouldBuffer = function() {
  return isNetlifyCI()
}

module.exports = { startOutput, stopOutput }
