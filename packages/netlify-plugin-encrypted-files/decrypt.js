#!/usr/bin/env node
'use strict'

const sade = require('sade')
// const path = require('path')
// const fs = require('fs')
// const crypto = require('crypto')
// const zlib = require('zlib')
// const { Transform } = require('stream')

const pluginDecrypt = require('./pluginDecrypt')

sade('decrypt', true)
  .version('0.0.1')
  .describe('Decrypt files. Expects a linked site and a .encrypt folder.')
  .example('decrypt')
  .option('-t, --testdecrypt', 'decrypt to a .testdecrypt folder instead of overwriting')
  // .option('-e, --etag', 'Enable "Etag" header')
  // // There are a lot...
  // .option('-H, --host', 'Hostname to bind', 'localhost')
  // .option('-p, --port', 'Port to bind', 5000)
  .action((opts) => {
    // remember, if you add an arg to decrypt, the signature of the .action callback changes to add that arg too

    pluginDecrypt(opts)
  })
  .parse(process.argv)
