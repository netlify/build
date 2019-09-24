const stream = require('stream')

const redactEnv = require('redact-env')
const isPlainObject = require('lodash.isplainobject')

function isObject(value) {
  var type = typeof value
  return value != null && (type === 'object' || type === 'function')
}

function getSecrets(secretKeys) {
  return redactEnv.build(secretKeys)
}

function redactValues(target, secrets) {
  // If it's not an object or string then it's a primitive. Nothing to redact.
  if (!isObject(target) && typeof target !== 'string') {
    return target
  }
  // Redact string values
  if (typeof target === 'string') {
    return redactEnv.redact(target, secrets)
  }
  // Redact Array values
  if (Array.isArray(target)) {
    return target.map(val => redactValues(val, secrets))
  } else if (isPlainObject(target)) {
    return Object.keys(target).reduce((newObj, key) => {
      newObj[key] = redactValues(target[key], secrets)
      return newObj
    }, {})
  }
  return target
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
