#!/usr/bin/env node
'use strict'

const sade = require('sade')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const rimraf = require('rimraf')
const zlib = require('zlib')
const { Transform } = require('stream')

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

sade('encrypt <regex>', true)
  .version('0.0.1')
  .describe('Encrypt files. Expects a linked site.')
  .example('build src/*.js --global --config my-conf.js')
  // .option('-D, --dev', 'Enable "dev" mode')
  // .option('-e, --etag', 'Enable "Etag" header')
  // // There are a lot...
  // .option('-H, --host', 'Hostname to bind', 'localhost')
  // .option('-p, --port', 'Port to bind', 5000)
  .action((regex, opts) => {
    if (typeof NETLIFY_ENCRYPT_KEY === 'undefined') {
      console.error('must define NETLIFY_ENCRYPT_KEY to use netlify-plugin-encrypted-files')
      process.exit(1)
    }
    // Program handler
    const filePaths = opts._
    if (!filePaths.length) throw new Error('no filePaths matched ' + regex)

    // prepare encrypt folder
    if (fs.existsSync('.encrypted')) console.log('clearing ' + '.encrypted') || rimraf.sync('.encrypted')
    fs.mkdirSync('.encrypted')

    filePaths.forEach((filePath) => {
      // path.basename('/foo/bar/baz/asdf/quux.html')
      // // returns
      // 'quux.html'
      // path.basename(fpath, path.extname(fpath))
      // const justFileName = path.basename(filePath, path.extname(filePath)) // 'quux'
      encrypt(filePath)
    })
  })
  .parse(process.argv)

// core crypto stuff
// https://medium.com/@brandonstilson/lets-encrypt-files-with-node-85037bea8c0e
function encrypt(file) {
  // Generate a secure, pseudo random initialization vector.
  const initVect = crypto.randomBytes(16)

  // Generate a cipher key from the password.
  const CIPHER_KEY = getCipherKey(ENCRYPTED_PLUGIN_SALT + NETLIFY_ENCRYPT_KEY)
  const readStream = fs.createReadStream(file)
  const gzip = zlib.createGzip()
  const cipher = crypto.createCipheriv('aes256', CIPHER_KEY, initVect)
  const appendInitVect = new AppendInitVect(initVect)
  // Create a write stream with a different file extension.

  let encryptedPath = Buffer.from(file).toString('base64')
  const destination = path.join('.encrypted', encryptedPath)
  const writeStream = fs.createWriteStream(destination)

  readStream
    .pipe(gzip)
    .pipe(cipher)
    .pipe(appendInitVect)
    .pipe(writeStream)
}

// util utils
function getCipherKey(password) {
  return crypto
    .createHash('sha256')
    .update(password)
    .digest()
}
// // https://stackoverflow.com/questions/13542667/create-directory-when-writing-to-file-in-node-js
// function ensureDirectoryExistence(filePath) {
//   var dirname = path.dirname(filePath)
//   if (fs.existsSync(dirname)) {
//     console.log('clearing ' + dirname)
//     rimraf.sync(dirname)
//     // return true
//   }
//   ensureDirectoryExistence(dirname)
//   fs.mkdirSync(dirname)
// }
