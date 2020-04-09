const { addErrorInfo } = require('./info')

// Retrieve error information from child process and re-build it in current
// process. We need this since errors are not JSON-serializable.
const buildError = function({ type, plugin, location, name, message, stack, ...errorProps }) {
  const error = new Error('')

  assignErrorProps(error, { name, message, stack })
  // Assign static error properties (if any)
  Object.assign(error, errorProps)

  // Distinguish between utils.build.*() errors and uncaught exceptions / bugs
  if (type !== undefined) {
    addErrorInfo(error, { type, plugin, location })
  }
  return error
}

// Make sure `name`, `message` and `stack` are not enumerable
const assignErrorProps = function(error, values) {
  ERROR_PROPS.forEach(name => {
    assignErrorProp(error, name, values[name])
  })
}

const ERROR_PROPS = ['name', 'message', 'stack']

const assignErrorProp = function(error, name, value) {
  Object.defineProperty(error, name, { value, enumerable: false, writable: true, configurable: true })
}

module.exports = { buildError }
