import { open, type FileHandle } from 'fs/promises'

// A tar header block is 512 bytes, and file contents are padded to the same
// boundary.
const BLOCK_SIZE = 512

// The entry name occupies the first 100 bytes of a header.
const NAME_LENGTH = 100

// The entry size is a 12-byte octal string starting at offset 124.
const SIZE_OFFSET = 124
const SIZE_LENGTH = 12

// The header checksum is an 8-byte octal string starting at offset 148.
const CHECKSUM_OFFSET = 148
const CHECKSUM_LENGTH = 8

// How many entries to inspect before giving up.
const MAX_ENTRIES = 4096

// An OCI archive is a tar of an OCI layout. Always carries this marker file.
const OCI_LAYOUT_MARKER = 'oci-layout'

// A Docker archive declares its images in a root manifest.
const DOCKER_MANIFEST_MARKER = 'manifest.json'

/**
 * Reports whether the file at `path` is a container image archive, in either
 * the OCI or the Docker flavor.
 *
 * The check reads tar headers rather than trusting the extension, since a
 * `.tar` in a functions directory could be anything. Only header blocks are
 * read, never entry contents, so the cost does not scale with image size.
 */
export const isImageArchive = async (path: string): Promise<boolean> => {
  let handle: FileHandle | undefined

  try {
    handle = await open(path, 'r')

    const header = Buffer.alloc(BLOCK_SIZE)
    let offset = 0

    for (let entry = 0; entry < MAX_ENTRIES; entry++) {
      const { bytesRead } = await handle.read(header, 0, BLOCK_SIZE, offset)

      if (bytesRead < BLOCK_SIZE) {
        return false
      }

      const name = readName(header)

      // Two consecutive empty blocks terminate a tar archive; a single empty
      // name means we have run out of entries to look at.
      if (name === '') {
        return false
      }

      // A tar header checksums its own bytes, so a file whose leading bytes
      // merely imitate a marker name fails here.
      if (!hasValidChecksum(header)) {
        return false
      }

      if (name === OCI_LAYOUT_MARKER || name === DOCKER_MANIFEST_MARKER) {
        return true
      }

      const size = readSize(header)

      if (size === undefined) {
        return false
      }

      // Skip the header and the entry's contents, rounded up to a block.
      offset += BLOCK_SIZE + Math.ceil(size / BLOCK_SIZE) * BLOCK_SIZE
    }

    return false
  } catch {
    // Unreadable, a directory, or not a tar at all: not an image archive.
    return false
  } finally {
    await handle?.close()
  }
}

const readName = (header: Buffer): string => {
  const raw = header.subarray(0, NAME_LENGTH)
  const end = raw.indexOf(0)

  return raw.subarray(0, end === -1 ? NAME_LENGTH : end).toString('utf8')
}

// The checksum field holds the sum of all header bytes with the field itself
// read as spaces.
const hasValidChecksum = (header: Buffer): boolean => {
  const raw = header.subarray(CHECKSUM_OFFSET, CHECKSUM_OFFSET + CHECKSUM_LENGTH).toString('utf8')
  const expected = parseInt(raw.replace(/\0/g, '').trim(), 8)

  if (Number.isNaN(expected)) {
    return false
  }

  let unsigned = 0
  let signed = 0

  for (let index = 0; index < BLOCK_SIZE; index++) {
    const inChecksumField = index >= CHECKSUM_OFFSET && index < CHECKSUM_OFFSET + CHECKSUM_LENGTH
    const byte = inChecksumField ? 0x20 : header[index]

    unsigned += byte
    signed += byte < 0x80 ? byte : byte - 0x100
  }

  return expected === unsigned || expected === signed
}

const readSize = (header: Buffer): number | undefined => {
  const raw = header.subarray(SIZE_OFFSET, SIZE_OFFSET + SIZE_LENGTH).toString('utf8')
  const octal = raw.replace(/\0/g, '').trim()

  if (octal === '') {
    return 0
  }

  const size = parseInt(octal, 8)

  return Number.isNaN(size) || size < 0 ? undefined : size
}
