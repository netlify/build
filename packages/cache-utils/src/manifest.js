import { promises as fs } from 'fs'
import { dirname } from 'path'

import del from 'del'
import { pathExists } from 'path-exists'

import { getExpires, checkExpires } from './expire.js'
import { getHash } from './hash.js'

// Retrieve cache manifest of a file to cache, which contains the file/directory
// contents hash and the `expires` date.
export const getManifestInfo = async function ({ cachePath, move, ttl, digests }) {
  const manifestPath = getManifestPath(cachePath)
  const expires = getExpires(ttl)
  const hash = await getHash(digests, move)
  const manifest = { expires, hash }
  const manifestString = `${JSON.stringify(manifest, null, 2)}\n`
  const identical = await isIdentical({ hash, manifestPath, manifestString })
  return { manifestInfo: { manifestPath, manifestString }, identical }
}

// Whether the cache manifest has changed
const isIdentical = async function ({ hash, manifestPath, manifestString }) {
  if (hash === undefined || !(await pathExists(manifestPath))) {
    return false
  }

  const oldManifestString = await fs.readFile(manifestPath, 'utf8')
  return oldManifestString === manifestString
}

// Persist the cache manifest to filesystem
export const writeManifest = async function ({ manifestPath, manifestString }) {
  await fs.mkdir(dirname(manifestPath), { recursive: true })
  await fs.writeFile(manifestPath, manifestString)
}

// Remove the cache manifest from filesystem
export const removeManifest = async function (cachePath) {
  const manifestPath = getManifestPath(cachePath)
  await del(manifestPath, { force: true })
}

// Retrieve the cache manifest filepath
const getManifestPath = function (cachePath) {
  return `${cachePath}${CACHE_EXTENSION}`
}

export const isManifest = function (filePath) {
  return filePath.endsWith(CACHE_EXTENSION)
}

const CACHE_EXTENSION = '.netlify.cache.json'

// Check whether a file/directory is expired by checking its cache manifest
export const isExpired = async function (cachePath) {
  const manifestPath = getManifestPath(cachePath)
  if (!(await pathExists(manifestPath))) {
    return false
  }

  const { expires } = await readManifest(cachePath)
  return checkExpires(expires)
}

const readManifest = async function (cachePath) {
  const manifestPath = getManifestPath(cachePath)
  const manifestString = await fs.readFile(manifestPath)
  const manifest = JSON.parse(manifestString)
  return manifest
}
