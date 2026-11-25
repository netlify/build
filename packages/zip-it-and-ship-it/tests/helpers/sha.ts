import { createHash } from 'crypto'
import { createReadStream } from 'fs'
import { pipeline } from 'stream/promises'

// Retrieve the SHA1 checksum of a file.
// Does it in streaming mode, for best performance.
export const computeSha1 = async function (filePath: string): Promise<string> {
  const hash = createHash('sha1')

  await pipeline(createReadStream(filePath), hash)

  return hash.digest('hex')
}
