const { redactStream, redactString } = require('./redact')
const { cleanStacks } = require('./stack')

const getOutputStream = function(childProcess) {
  return redactStream(childProcess.all)
}

const writeProcessOutput = function(output) {
  process.stdout.write(output)
}

const writeProcessError = function(error) {
  process.stdout.write(`${redactString(cleanStacks(error.all))}\n`)
}

module.exports = { getOutputStream, writeProcessOutput, writeProcessError }
