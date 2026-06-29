import crypto from 'node:crypto'
import { createReadStream } from 'node:fs'

export const getFileHash = (path: string): Promise<string> => {
  const hash = crypto.createHash('sha256')

  hash.setEncoding('hex')

  return new Promise((resolve, reject) => {
    const file = createReadStream(path)

    file.on('end', () => {
      hash.end()

      resolve(hash.read())
    })
    file.on('error', reject)

    file.pipe(hash)
  })
}
