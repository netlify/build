import crypto from 'node:crypto'
import { createReadStream, promises as fs } from 'node:fs'
import path from 'node:path'

export const getDirectoryHash = async (dirPath: string): Promise<string> => {
  const entries: string[] = []

  async function walk(currentPath: string): Promise<void> {
    const dirents = await fs.readdir(currentPath, { withFileTypes: true })
    for (const dirent of dirents) {
      const fullPath = path.join(currentPath, dirent.name)
      const relativePath = path.relative(dirPath, fullPath)

      if (dirent.isDirectory()) {
        await walk(fullPath)
      } else if (dirent.isFile() || dirent.isSymbolicLink()) {
        const fileHash = await getFileHash(fullPath)
        entries.push(`${relativePath}:${fileHash}`)
      }
    }
  }

  await walk(dirPath)

  return getStringHash(entries.sort((a, b) => a.localeCompare(b)).join('\n'))
}

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

export const getStringHash = (input: string) => {
  const hash = crypto.createHash('sha256')

  hash.setEncoding('hex')
  hash.update(input)

  return hash.digest('hex')
}
