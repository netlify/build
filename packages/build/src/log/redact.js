const redactEnv = require('redact-env')
const replaceStream = require('replacestream')

const redactString = function(string) {
  return redactEnv.redact(string, secrets)
}

// istanbul ignore next
const redactStream = function(stream) {
  return stream.pipe(replaceStream(secrets, '[secure]'))
}

const SECRETS = ['SECRET_ENV_VAR', 'MY_API_KEY']
const secrets = redactEnv.build(SECRETS)

module.exports = { redactString, redactStream }
