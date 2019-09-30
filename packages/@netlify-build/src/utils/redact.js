const stream = require('stream')

const redactEnv = require('redact-env')
// TODO: npm uninstall es6-week-map after
// https://github.com/mcmath/deep-map/pull/15 is merged
const deepMap = require('deep-map')

function getSecrets(secretKeys) {
  return redactEnv.build(secretKeys)
}

function redactValues(target, secrets) {
  return deepMap(target, value => redactEnv.redact(value, secrets))
}

function redactStream(secrets) {
  return new RedactTransform(secrets)
}

class RedactTransform extends stream.Transform {
  constructor(o) {
    super({ objectMode: true })
    this.lastLineData = ''
    this.secrets = o
  }
  _transform(chunk, encoding, cb) {
    let data = String(chunk)
    if (this.lastLineData) {
      data = this.lastLineData + data
    }
    const lines = data.split('\n')
    this.lastLineData = lines.splice(lines.length - 1, 1)[0]
    for (let l of lines) {
      const newLine = redactEnv.redact(l, this.secrets)
      this.push(newLine + '\n')
    }
    cb()
  }
  _flush(cb) {
    if (!this.lastLineData) {
      return cb()
    }
    this.push(this.lastLineData + '\n')
    this.lastLineData = ''
    cb()
  }
}

module.exports = {
  getSecrets,
  redactValues,
  redactStream
}
