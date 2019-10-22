const isNetlifyCI = require('../utils/is-netlify-ci.js')

const { redactProcess, redactString } = require('./patch')

// In CI, we need to buffer child processes output at the moment due to the
// current BuildBot not handling it correctly.
// But locally we want to stream output instead for a better developer
// experience.
// See https://github.com/netlify/build/issues/343
const streamProcessOutput = function(childProcess) {
  const { stdout, stderr, all } = redactProcess(childProcess)

  if (!shouldBuffer()) {
    stdout.pipe(process.stdout)
    stderr.pipe(process.stderr)
  }

  return all
}

const writeProcessOutput = function(output) {
  if (shouldBuffer()) {
    process.stdout.write(output)
  }
}

const writeProcessError = function({ all }) {
  if (shouldBuffer()) {
    process.stdout.write(`${redactString(all)}\n`)
  }
}

const shouldBuffer = function() {
  return isNetlifyCI()
}

module.exports = { streamProcessOutput, writeProcessOutput, writeProcessError }
