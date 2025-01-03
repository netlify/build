import { Buffer } from 'buffer'
import { createWriteStream, Stats, readlinkSync } from 'fs'
import { Writable } from 'stream'

import archiver, { Archiver } from 'archiver'
import cpio from 'cpio-stream'

import { ObjectValues } from './types/utils.js'

export { Archiver as ZipArchive } from 'archiver'

export const ARCHIVE_FORMAT = {
  CPIO: 'cpio',
  NONE: 'none',
  ZIP: 'zip',
} as const

export type ArchiveFormat = ObjectValues<typeof ARCHIVE_FORMAT>

// Start cpio archive for files
export const startCpio = function (destPath: string): { archive: any; output: Writable } {
  const output = createWriteStream(destPath)
  const archive = cpio.pack()

  archive.pipe(output)

  return { archive, output }
}

// Add new file to cpio
export const addCpioFile = function (
  archive: any,
  file: string,
  name: string,
  stat?: Stats,
  content?: Buffer | string,
): void {
  if (stat?.isSymbolicLink()) {
    const linkContent = readlinkSync(file)

    archive.entry({ name: name, linkname: linkContent, mode: stat.mode, type: 'symlink' })
  } else {
    archive.entry(
      {
        type: 'file',
        name,
        mode: stat?.mode,
        // Ensure sha256 stability regardless of mtime
        mtime: new Date(0),
        dev: stat?.dev,
        ino: stat?.ino,
        nlink: stat?.nlink,
        uid: stat?.uid,
        gid: stat?.gid,
        rdev: stat?.rdev,
        size: stat?.size,
      },
      content,
    )
  }
}

// End cpioing files
export const endCpio = async function (archive: any, output: Writable): Promise<void> {
  const result = new Promise<void>((resolve, reject) => {
    output.on('error', (error) => reject(error))
    output.on('finish', () => resolve())
  })

  archive.finalize()

  return result
}

// Start zipping files
export const startZip = function (destPath: string): { archive: Archiver; output: Writable } {
  const output = createWriteStream(destPath)
  const archive = archiver('zip')

  archive.pipe(output)

  return { archive, output }
}

// Add new file to zip
export const addZipFile = function (archive: Archiver, file: string, name: string, stat: Stats): void {
  if (stat.isSymbolicLink()) {
    const linkContent = readlinkSync(file)

    archive.symlink(name, linkContent, stat.mode)
  } else {
    archive.file(file, {
      name,
      mode: stat.mode,
      // Ensure sha256 stability regardless of mtime
      date: new Date(0),
      stats: stat,
    })
  }
}

// Add new file content to zip
export const addZipContent = function (archive: Archiver, content: Buffer | string, name: string): void {
  archive.append(content, { name, date: new Date(0) })
}

// End zipping files
export const endZip = async function (archive: Archiver, output: Writable): Promise<void> {
  const result = new Promise<void>((resolve, reject) => {
    output.on('error', (error) => reject(error))
    output.on('finish', () => resolve())
  })

  await archive.finalize()

  return result
}
