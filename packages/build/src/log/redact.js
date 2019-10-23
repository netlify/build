const redactEnv = require('redact-env')
const replaceStream = require('replacestream')

const redactString = function(string) {
  return redactEnv.redact(string, secrets)
}

const redactProcess = function({ stdout, stderr, all }) {
  const stdoutA = stdout.pipe(replaceStream(secrets, '[secure]'))
  const stderrA = stderr.pipe(replaceStream(secrets, '[secure]'))
  const allA = all.pipe(replaceStream(secrets, '[secure]'))
  return { stdout: stdoutA, stderr: stderrA, all: allA }
}

const SECRETS = ['SECRET_ENV_VAR', 'MY_API_KEY']
const secrets = redactEnv.build(SECRETS)

module.exports = { redactString, redactProcess }
