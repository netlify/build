// // just copy psate from the decrypt file
const sade = require('sade')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const zlib = require('zlib')
const { Transform } = require('stream')
const prog = sade('encrypt')

const ENCRYPTED_PLUGIN_SALT = 'ENCRYPTED_PLUGIN_SALT'
const { NETLIFY_ENCRYPT_KEY } = process.env

// for crypto stuff later
class AppendInitVect extends Transform {
  constructor(initVect, opts) {
    super(opts)
    this.initVect = initVect
    this.appended = false
  }

  _transform(chunk, encoding, cb) {
    if (!this.appended) {
      this.push(this.initVect)
      this.appended = true
    }
    this.push(chunk)
    cb()
  }
}

module.exports = function pluginDecrypt({
  // unzip to '.testdecrypt' folder instead of overwriting real files
  testdecrypt = false,
}) {
  if (typeof NETLIFY_ENCRYPT_KEY === 'undefined') {
    console.error('must define NETLIFY_ENCRYPT_KEY to use netlify-plugin-encrypted-files')
    process.exit(1)
  }
  const files = fs.readdirSync('.encrypted')
  files.forEach((sourceFilePath) => {
    let destinationfilePath = Buffer.from(sourceFilePath, 'base64').toString()
    decrypt(path.join('.encrypted', sourceFilePath), destinationfilePath, testdecrypt)
  })
}

// core crypto stuff
// https://medium.com/@brandonstilson/lets-encrypt-files-with-node-85037bea8c0e

function decrypt(sourceFilePath, destinationfilePath, testdecrypt) {
  // First, get the initialization vector from the file.
  const readInitVect = fs.createReadStream(sourceFilePath, { end: 15 })

  let initVect
  readInitVect.on('data', (chunk) => {
    initVect = chunk
  })

  // Once we’ve got the initialization vector, we can decrypt the file.
  readInitVect.on('close', () => {
    const cipherKey = getCipherKey(ENCRYPTED_PLUGIN_SALT + NETLIFY_ENCRYPT_KEY)
    const readStream = fs.createReadStream(sourceFilePath, { start: 16 })
    const decipher = crypto.createDecipheriv('aes256', cipherKey, initVect)
    const unzip = zlib.createUnzip()
    const destination = testdecrypt ? path.join('.testdecrypt', destinationfilePath) : destinationfilePath
    ensureDirectoryExistence(destination)
    const writeStream = fs.createWriteStream(destination)
    readStream
      .pipe(decipher)
      .pipe(unzip)
      .pipe(writeStream)
  })
}

// util utils
function getCipherKey(password) {
  return crypto
    .createHash('sha256')
    .update(password)
    .digest()
}
// https://stackoverflow.com/questions/13542667/create-directory-when-writing-to-file-in-node-js
function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath)
  if (fs.existsSync(dirname)) {
    return true
  }
  ensureDirectoryExistence(dirname)
  fs.mkdirSync(dirname)
}
