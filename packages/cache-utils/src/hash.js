const { createHash } = require('crypto')
const { stat, readFile, createReadStream } = require('fs')
const { promisify } = require('util')
const { relative } = require('path')
const { cpus } = require('os')

const getStream = require('get-stream')
const readdirp = require('readdirp')
const junk = require('junk')
const pMap = require('p-map')

const pStat = promisify(stat)
const pReadFile = promisify(readFile)

// Compute the hash of a file's contents.
// Use SHA256 on the contents. Also hashes some file metadata: file path, file
// type, permissions, uid/gid.
const getHash = async function({ srcPath, move, digests, base }) {
  // Moving files is faster than computing hashes
  if (move) {
    return ''
  }

  const { digestPath, fileStat } = await findDigest(srcPath, digests)

  if (fileStat.isDirectory()) {
    return hashDir(digestPath, fileStat, base)
  }

  return hashFile(digestPath, fileStat, base)
}

// Computing a big directory like `node_modules` is slow. However those can
// sometime be represented by a digest file such as `package-lock.json` which
// is much smaller and fast to hash. We allow specifying those using the
// `digests` option.
const findDigest = async function(srcPath, digests) {
  const fileStats = await Promise.all([...digests, srcPath].map(getStat))
  return fileStats.find(Boolean)
}

const getStat = async function(digestPath) {
  try {
    const fileStat = await pStat(digestPath)
    return { digestPath, fileStat }
  } catch (error) {
    return
  }
}

// Hash a directory recursively
const hashDir = async function(dirPath, fileStat, base) {
  const files = await readdirp.promise(dirPath, { fileFilter, alwaysStat: true })
  const dirHashInfo = getHashInfo(dirPath, fileStat, base)
  const hashInfos = await pMap(files, ({ fullPath, stats }) => getFileInfo(fullPath, stats, base), {
    concurrency: MAX_CONCURRENCY,
  })
  const hash = await computeHash([dirHashInfo, ...hashInfos])
  return hash
}

// We do not copy temporary files like `*~` nor hash them
const fileFilter = function({ basename }) {
  return junk.not(basename)
}

// Hash a regular file
const hashFile = async function(filePath, fileStat, base) {
  const hashInfo = await getFileInfo(filePath, fileStat, base)
  const hash = await computeHash([hashInfo])
  return hash
}

// Avoid memory crashes due to too high parallelism.
// This is mostly CPU-bound (hashing), so higher values actually make it slower.
const MAX_CONCURRENCY = cpus().length

const getFileInfo = async function(filePath, stat, base) {
  const content = await getContent(filePath, stat)
  const hashInfo = getHashInfo(filePath, stat, base, content)
  return hashInfo
}

// If a file is too big, we stream it and hash it first so it does not take up
// memory. Otherwise files with lots of big files can end up taking the whole
// memory and crash the process.
const getContent = function(filePath, { size }) {
  if (size < MAX_HASH_CONTENT) {
    return pReadFile(filePath, 'utf8')
  }

  const fileStream = createReadStream(filePath)
  return hashStream(fileStream)
}

const MAX_HASH_CONTENT = 1e5

const getHashInfo = function(filePath, { mode, uid, gid }, base, content) {
  const path = relative(base, filePath)
  return { path, content, mode, uid, gid }
}

const computeHash = async function(hashInfos) {
  hashInfos.sort(comparePath)
  const hashInfosString = JSON.stringify(hashInfos)
  const hash = await hashString(hashInfosString)
  return hash
}

// When hashing a directory, sort its files by path so the hash is stable.
// The hashes are often already sorted, which is why we skip test coverage.
// istanbul ignore next
const comparePath = function(hashInfoA, hashInfoB) {
  if (hashInfoA.path > hashInfoB.path) {
    return 1
  }

  if (hashInfoA.path < hashInfoB.path) {
    return -1
  }

  return 0
}

const hashStream = async function(stream) {
  const hashStream = stream.pipe(createHash(HASH_ALGO, { encoding: 'hex' }))
  const hash = await getStream(hashStream)
  return hash
}

const hashString = async function(string) {
  const hashStream = createHash(HASH_ALGO, { encoding: 'hex' })
  hashStream.end(string)
  const hash = await getStream(hashStream)
  return hash
}

// We need a hashing algoritm that's as fast as possible.
// Userland CRC32 implementations are actually slower than Node.js SHA1.
const HASH_ALGO = 'sha1'

module.exports = { getHash }
