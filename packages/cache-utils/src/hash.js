'use strict'

const { createHash } = require('crypto')
const { createReadStream } = require('fs')

const getStream = require('get-stream')
const locatePath = require('locate-path')

// Caching a big directory like `node_modules` is slow. However those can
// sometime be represented by a digest file such as `package-lock.json`. If this
// has not changed, we don't need to save cache again.
const getHash = async function (digests, move) {
  // Moving files is faster than computing hashes
  if (move || digests.length === 0) {
    return
  }

  const digestPath = await locatePath(digests)
  if (digestPath === undefined) {
    return
  }

  const hash = await hashFile(digestPath)
  return hash
}

// Hash a file's contents
const hashFile = async function (path) {
  const contentStream = createReadStream(path, 'utf8')
  const hashStream = createHash(HASH_ALGO, { encoding: 'hex' })
  contentStream.pipe(hashStream)
  const hash = await getStream(hashStream)
  return hash
}

// We need a hashing algoritm that's as fast as possible.
// Userland CRC32 implementations are actually slower than Node.js SHA1.
const HASH_ALGO = 'sha1'

module.exports = { getHash }
