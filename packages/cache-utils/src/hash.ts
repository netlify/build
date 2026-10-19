import { createHash } from 'crypto'
import { createReadStream, promises as fs } from 'fs'
import { isAbsolute, resolve } from 'path'

import getStream from 'get-stream'

import { safeGetCwd } from './utils/cwd.js'

// We need a hashing algorithm that's as fast as possible.
// Userland CRC32 implementations are actually slower than Node.js SHA1.
const HASH_ALGO = 'sha1'

// Caching a big directory like `node_modules` is slow. However, those can
// sometime be represented by a digest file such as `package-lock.json`. If this
// has not changed, we don't need to save cache again.
export const getHash = async function (digests: string[] = [], move: boolean, cwdOpt?: string) {
  // Moving files is faster than computing hashes
  if (move || digests.length === 0) {
    return
  }

  const cwd = await safeGetCwd(cwdOpt)
  let digestPath: string | undefined = undefined

  for (const digest of digests) {
    try {
      const resolvedDigest = cwd !== '' && !isAbsolute(digest) ? resolve(cwd, digest) : resolve(digest)
      const stat = await fs.stat(resolvedDigest)
      if (stat.isFile()) {
        digestPath = resolvedDigest
        break
      }
    } catch {
      continue
    }
  }

  if (digestPath === undefined) {
    return
  }

  const hash = await hashFile(digestPath)
  return hash
}

// Hash a file's contents
const hashFile = async function (path: string) {
  const contentStream = createReadStream(path, 'utf8')
  const hashStream = createHash(HASH_ALGO, { encoding: 'hex' })
  contentStream.pipe(hashStream)
  const hash = await getStream(hashStream)
  return hash
}
