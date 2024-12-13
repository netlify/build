import { Buffer } from 'node:buffer'
import crypto from 'node:crypto'
import fs from 'node:fs'

export const getFileHash = (path: string): Promise<string> => {
  const hash = crypto.createHash('sha256')

  hash.setEncoding('hex')

  return new Promise((resolve, reject) => {
    const file = fs.createReadStream(path)

    file.on('end', () => {
      hash.end()

      resolve(hash.read())
    })
    file.on('error', reject)

    file.pipe(hash)
  })
}

export const getStringHash = (input: string) => {
  const hash = crypto.createHash('sha256')

  hash.setEncoding('hex')
  hash.update(input)

  return hash.digest('hex')
}

export const readFileAndHash = (path: string) => {
  const file = fs.createReadStream(path)
  const hash = crypto.createHash('sha256')
  const chunks: Uint8Array[] = []

  hash.setEncoding('hex')

  return new Promise<{ contents: string; hash: string }>((resolve, reject) => {
    file
      .on('data', (chunk) => {
        chunks.push(Buffer.from(chunk))

        hash.update(chunk.toString())
      })
      .on('error', reject)
      .on('end', () => {
        const contents = Buffer.concat(chunks).toString('utf8')

        return resolve({
          contents,
          hash: hash.digest('hex'),
        })
      })
  })
}
