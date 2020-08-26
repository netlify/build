const { writeFile, readFile } = require('fs')
const { dirname } = require('path')
const { promisify } = require('util')

const del = require('del')
const makeDir = require('make-dir')
const pathExists = require('path-exists')

const { getExpires, checkExpires } = require('./expire')
const { getHash } = require('./hash')

const pWriteFile = promisify(writeFile)
const pReadFile = promisify(readFile)

// Retrieve cache manifest of a file to cache, which contains the file/directory
// contents hash and the `expires` date.
const getManifestInfo = async function({ cachePath, move, ttl, digests }) {
  const manifestPath = getManifestPath(cachePath)
  const expires = getExpires(ttl)
  const hash = await getHash(digests, move)
  const manifest = { expires, hash }
  const manifestString = `${JSON.stringify(manifest, null, 2)}\n`
  const identical = await isIdentical({ hash, manifestPath, manifestString })
  return { manifestInfo: { manifestPath, manifestString }, identical }
}

// Whether the cache manifest has changed
const isIdentical = async function({ hash, manifestPath, manifestString }) {
  if (hash === undefined || !(await pathExists(manifestPath))) {
    return false
  }

  const oldManifestString = await pReadFile(manifestPath, 'utf8')
  return oldManifestString === manifestString
}

// Persist the cache manifest to filesystem
const writeManifest = async function({ manifestPath, manifestString }) {
  await makeDir(dirname(manifestPath))
  await pWriteFile(manifestPath, manifestString)
}

// Remove the cache manifest from filesystem
const removeManifest = async function(cachePath) {
  const manifestPath = getManifestPath(cachePath)
  await del(manifestPath, { force: true })
}

// Retrieve the cache manifest filepath
const getManifestPath = function(cachePath) {
  return `${cachePath}${CACHE_EXTENSION}`
}

const isManifest = function(filePath) {
  return filePath.endsWith(CACHE_EXTENSION)
}

const CACHE_EXTENSION = '.netlify.cache.json'

// Check whether a file/directory is expired by checking its cache manifest
const isExpired = async function(cachePath) {
  const manifestPath = getManifestPath(cachePath)
  if (!(await pathExists(manifestPath))) {
    return false
  }

  const { expires } = await readManifest(cachePath)
  return checkExpires(expires)
}

const readManifest = async function(cachePath) {
  const manifestPath = getManifestPath(cachePath)
  const manifestString = await pReadFile(manifestPath, 'utf8')
  const manifest = JSON.parse(manifestString)
  return manifest
}

module.exports = { getManifestInfo, writeManifest, removeManifest, isManifest, isExpired }
