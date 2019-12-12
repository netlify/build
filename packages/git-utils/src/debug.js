const debugModule = require('debug')

const debug = value => {
  const d = debugModule(`gitUtil:${value}`)
  // In Peril, when running inside Hyper, we don't get access to stderr
  // so bind debug to use stdout
  if (process.env.x_hyper_content_sha256) {
    d.log = console.log.bind(console)
  }
  return d
}

module.exports.debug = debug
