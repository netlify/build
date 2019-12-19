const { createHash } = require('crypto')
const { stat, readFile } = require('fs')
const { promisify } = require('util')
const { relative } = require('path')

const getStream = require('get-stream')
const readdirp = require('readdirp')
const junk = require('junk')

const pStat = promisify(stat)
const pReadFile = promisify(readFile)

// Compute the hash of a file's contents.
// Use SHA256 on the contents. Also hashes some file metadata: file path, file
// type, permissions, uid/gid.
const getHash = async function(srcPath, base) {
  const fileStat = await pStat(srcPath)

  if (fileStat.isDirectory()) {
    return hashDir(srcPath, fileStat, base)
  }

  return hashFile(srcPath, fileStat, base)
}

// Hash a directory recursively
const hashDir = async function(dirPath, fileStat, base) {
  const files = await readdirp.promise(dirPath, { fileFilter, alwaysStat: true })
  const hashInfos = await Promise.all([
    getHashInfo(dirPath, fileStat, base),
    ...files.map(({ fullPath, stats }) => getFileInfo(fullPath, stats, base)),
  ])
  const hash = await computeHash(hashInfos)
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

const getFileInfo = async function(filePath, stat, base) {
  const content = await pReadFile(filePath, 'utf8')
  const hashInfo = await getHashInfo(filePath, stat, base, content)
  return hashInfo
}

const getHashInfo = async function(filePath, { mode, uid, gid }, base, content) {
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

const hashString = async function(string) {
  const hashStream = createHash(HASH_ALGO)
  hashStream.end(string)
  const hash = await getStream(hashStream, { encoding: 'hex' })
  return hash
}

const HASH_ALGO = 'sha256'

module.exports = { getHash }
