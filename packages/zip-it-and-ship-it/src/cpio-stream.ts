import constants from 'node:constants'
import { mkdirSync, createWriteStream, createReadStream } from 'node:fs'
import { dirname, join } from 'node:path'
import { Readable, Writable, PassThrough, finished } from 'node:stream'

import bl from 'bl'
import type BufferList from 'bl'

// Helper function to pad the file name so that it is a multiple of 4 bytes.
function padName(name: string): string {
  const modulo = (name.length + 2) % 4 // Calculate the required padding to make the name length a multiple of 4.
  const padding = (4 - modulo) % 4 // Calculate how many '\0' characters need to be added.
  return name + '\0'.repeat(padding) // Return the padded name string.
}

// Helper function to encode a number into a hexadecimal string with a fixed byte length.
function encodeHex(number: number, bytes: number): string {
  number = number || 0
  let str = Math.min(number, Math.pow(16, bytes) - 1).toString(16) // Convert the number to hexadecimal.
  str = str.toUpperCase() // Ensure the hex string is uppercase.
  str = '0'.repeat(bytes - str.length) + str // Pad the hex string to the specified byte length.
  return str
}

export class CPIOPacker extends Readable {
  #padding: number
  #ino: number
  #finalized: boolean
  #destroyed: boolean
  _drain: () => void
  #size: number

  constructor() {
    super()
    this.#padding = 512 // Default padding to 512 bytes.
    this.#ino = 1 // Initial inode number, incremented for each new entry.

    this.#finalized = false // Indicates if the archive has been finalized.
    this.#destroyed = false // Indicates if the stream has been destroyed.
    this._drain = noop // Function to handle draining the stream.
    this.#size = 0 // The current size of the archive.
  }

  // Internal method to encode the header information for each entry in the archive.
  #encode(opts) {
    // Ensure the name ends with a null byte
    if (opts.name[opts.name.length - 1] !== '\0') {
      opts.name += '\0'
    }

    // Pad the name to ensure its length is a multiple of 4 bytes.
    const paddedName = padName(opts.name)

    const buf = Buffer.alloc(110 + paddedName.length) // Allocate buffer for the entry header.

    // Convert mtime to seconds if it is a Date object.
    if (opts.mtime instanceof Date) {
      opts.mtime = Math.round(opts.mtime.getTime() / 1000)
    }

    buf.write('070701', 0) // Magic number for the cpio format.
    buf.write(encodeHex(opts.ino, 8), 6) // Inode number.
    buf.write(encodeHex(opts.mode, 8), 14) // File mode.
    buf.write(encodeHex(opts.uid, 8), 22) // User ID.
    buf.write(encodeHex(opts.gid, 8), 30) // Group ID.
    buf.write(encodeHex(opts.nlink, 8), 38) // Number of links.
    buf.write(encodeHex(opts.mtime, 8), 46) // Modification time (in seconds).
    buf.write(encodeHex(opts.size, 8), 54) // File size.
    buf.write(encodeHex(opts.devmajor, 8), 62) // Major device number.
    buf.write(encodeHex(opts.devminor, 8), 70) // Minor device number.
    buf.write(encodeHex(opts.rdevmajor, 8), 78) // Major number for the rdev.
    buf.write(encodeHex(opts.rdevminor, 8), 86) // Minor number for the rdev.
    buf.write(encodeHex(opts.name.length, 8), 94) // Length of the file name.
    buf.write(encodeHex(0, 8), 102) // Reserved space (set to zero).
    buf.write(paddedName, 110) // File name (padded to the required length).

    return buf
  }

  // Method to add a new entry (file, directory, symlink, etc.) to the cpio archive.
  entry(header, buffer?) {
    // If the archive is finalized or destroyed, ignore this call.
    if (this.#finalized || this.#destroyed) return

    // If it's a symlink, use the link name as the buffer.
    if (header.linkname) buffer = Buffer.from(header.linkname)

    // Set default values for various attributes if they are not provided.
    if (!header.dev) header.dev = parseInt('777777', 8) // Default device number.
    if (!header.ino) header.ino = this.#ino++ // Increment the inode number for each new entry.
    if (!header.mode) header.mode = parseInt('100644', 8) // Default file mode (regular file).
    if (!header.nlink) header.nlink = 1 // Default number of links.
    if (!header.mtime) header.mtime = new Date() // Default modification time (current time).
    if (!header.rdevminor) header.rdevminor = header.rdev // Set rdevminor to rdev if not provided.
    if (!header.devminor) header.devminor = header.dev // Set devminor to dev if not provided.

    // Set the file mode based on the type of entry (file, directory, symlink, etc.).
    if (header.type) header.mode = typeToMode(header.type, header.mode)

    // If the buffer is a string, convert it to a Buffer.
    if (typeof buffer === 'string') buffer = Buffer.from(buffer)
    if (Buffer.isBuffer(buffer)) {
      header.size = buffer.length // Set the file size based on the buffer length.

      // Encode the header and push it to the archive stream.
      this._push(this.#encode(header))

      // Push the actual file data (buffer) to the archive stream.
      this._push(buffer)

      // Calculate and push the necessary padding to make the buffer size a multiple of 4 bytes.
      const mod4 = buffer.length % 4
      const paddinglength = (4 - mod4) % 4
      this._push(Buffer.from('\0'.repeat(paddinglength)))
    } else {
      // Encode the header and push it to the archive stream.
      this._push(this.#encode(header))
    }
  }

  // Finalize the cpio archive by adding the "TRAILER!!!" entry and padding the stream.
  finalize() {
    if (this.#finalized) return // If the archive is already finalized, do nothing.
    this.#finalized = true

    // Add a "TRAILER!!!" entry to mark the end of the archive.
    this._push(this.#encode({ name: 'TRAILER!!!', nlink: 1 }))

    // Create padding to ensure the final size of the archive is a multiple of the padding size.
    const fill = Buffer.alloc(this.#padding)
    this.push(fill.subarray(0, this.#padding - this.#size)) // Add the padding to the stream.

    this.push(null) // Signal the end of the stream.
  }

  // Helper method to push data to the stream.
  _push(data) {
    this.#size += data.length // Update the current size of the archive.
    if (this.#size >= this.#padding) this._push = this.push // Switch to using the push method once padding size is reached.

    return this.push(data) // Push the data to the stream.
  }

  // Destroy the stream, releasing resources.
  destroy(err) {
    if (this.#destroyed) return this // If already destroyed, do nothing.
    this.#destroyed = true

    if (err) this.emit('error', err)
    this.emit('close')
    return this
  }

  // Internal read method to handle draining the stream.
  _read() {
    const drain = this._drain
    this._drain = noop // Reset the drain handler.
    drain() // Call the original drain handler.
  }
}

function noop() {
  //
}

// A mask value used to process file mode values.
const MASK = parseInt('7777', 8)

// Helper function to determine the file mode based on the entry type.
function typeToMode(type: string, mode: number): number {
  let value = 0
  if (type === 'file') value = constants.S_IFREG // Regular file.
  if (type === 'directory') value = constants.S_IFDIR // Directory.
  if (type === 'symlink') value = constants.S_IFLNK // Symlink.
  if (type === 'socket') value = constants.S_IFSOCK // Socket.
  if (type === 'block-device') value = constants.S_IFBLK // Block device.
  if (type === 'character-device') value = constants.S_IFCHR // Character device.
  if (type === 'fifo') value = constants.S_IFIFO // FIFO (named pipe).

  // Return the computed mode with the mask applied.
  return (value || constants.S_IFMT & mode) | (MASK & mode)
}

function emptyStream(self, offset) {
  const s = new Source(self, offset)
  s.end()
  return s
}

class Source extends PassThrough {
  _parent: any
  offset: any
  constructor(self, offset) {
    super({ autoDestroy: false })
    this._parent = self
    this.offset = offset
  }
  destroy(err) {
    this._parent.destroy(err)
    return this
  }
}

export async function extractCPIO(archivePath: string, dest: string) {
  return new Promise<void>((resolve, reject) => {
    const extractor = new CPIOExtractor()
    extractor.on('entry', function (header, stream, callback) {
      const destination = join(dest, header.name)
      mkdirSync(dirname(destination), { recursive: true })
      const file = createWriteStream(destination)
      stream.pipe(file)
      finished(stream, callback)
    })

    extractor.on('finish', function () {
      resolve()
    })
    extractor.on('error', function (err) {
      reject(err)
    })

    const pack = createReadStream(archivePath)
    pack.pipe(extractor)
  })
}

type Header = {
  ino: number
  mode: number
  uid: number
  gid: number
  nlink: number
  mtime: Date
  size: number
  devmajor: number
  devminor: number
  rdevmajor: number
  rdevminor: number
  _nameLength: number
  _sizeStrike: number
  _nameStrike: number
  name: string
  linkname: string
  type: string
}

const headerSize = 104

// CPIOExtractor class extends Writable stream to process CPIO archive format.
class CPIOExtractor extends Writable {
  #offset: number
  #buffer: any
  #strike: number
  #missing: number
  #onparse: () => void
  #header: null | Header
  #stream: Source | null
  #overflow: null
  #cb: null | (() => void)
  #locked: boolean
  #destroyed: boolean
  #end: boolean

  constructor() {
    super()

    this.#offset = 0 // Position in the data buffer.
    this.#buffer = bl() // Buffer to hold data as it is processed.
    this.#strike = 0 // Number of bytes to skip.
    this.#missing = 0 // Remaining bytes to process.
    this.#onparse = noop // Callback for parsing.
    this.#header = null // Header information for the current entry.
    this.#stream = null // Stream for handling data of the current entry.
    this.#overflow = null // Holds leftover data if entry size exceeds buffer.
    this.#cb = null // Callback function to call after processing.
    this.#locked = false // Indicates if the stream is locked for further writes.
    this.#destroyed = false // Indicates if the stream is destroyed.
    this.#end = false // Indicates if the end of the archive is reached.

    // Continue parsing when data is ready.
    const oncontinue = () => {
      this._continue()
    }

    // Handle unlocking the stream and continuing parsing.
    const onunlock = (err) => {
      this.#locked = false
      if (err) return this.destroy(err) // Destroy the stream if there's an error.
      if (!this.#stream) oncontinue() // Continue if no stream is active.
    }

    // Process entry type from the buffer and start parsing accordingly.
    const ontype = () => {
      try {
        assertNewcFormat(this.#buffer)
      } catch (err) {
        this.emit('error', err) // Emit error if format is not newc.
      }

      this._parse(headerSize, onheader)

      oncontinue()
    }

    // Parse header from the CPIO archive entry.
    const onheader = () => {
      let header
      try {
        header = this.#header = newcDecoder(this.#buffer) // Decode header information.
      } catch (err) {
        console.log(err)
        this.emit('error', err) // Emit error if header decoding fails.
      }

      if (header) {
        this._parse(header._nameStrike, onname) // Parse the entry name.
      } else {
        this._parse(headerSize, onheader) // Reparse header if decoding fails.
      }

      oncontinue()
    }

    // Handle symlink entries.
    const onsymlink = () => {
      const b = this.#buffer
      const header = this.#header!
      const data = b.slice(0, header.size) // Extract symlink data.
      try {
        header.linkname = data.toString() // Decode linkname as a string.
        b.consume(header.size) // Consume the processed data.
      } catch (err) {
        this.emit('error', err) // Emit error if symlink parsing fails.
      }
      // Emit 'entry' event with header and stream data.
      this.emit('entry', header, emptyStream(self, this.#offset), () => {
        this._parse(6, ontype) // Parse the next entry type.
        oncontinue() // Continue processing.
      })
    }

    // Handle entry names and process according to the type.
    const onname = () => {
      const header = this.#header!
      const b = this.#buffer

      try {
        // Extract the entry name.
        header.name = b.slice(0, header._nameLength - 1).toString('ascii')
        b.consume(header._nameStrike) // Consume processed name bytes.
      } catch (err) {
        this.emit('error', err) // Emit error if name parsing fails.
      }

      // If the entry is a special "TRAILER!!!" entry, mark the end of parsing.
      if (header.name === 'TRAILER!!!') {
        this.#onparse = noop
        this.#end = true
        return oncontinue()
      }

      if (header.size === 0) {
        // Handle entries with no size (e.g., directories).
        this.emit('entry', header, emptyStream(this, this.#offset), onunlock)
        return this._parse(6, ontype) // Parse the next entry.
      }

      if (header.type === 'symlink') {
        // Handle symlink entries.
        this._parse(header._sizeStrike, onsymlink, header.size)
        return oncontinue()
      }

      // Create a stream for the file entry.
      this.#stream = new Source(this, this.#offset)
      this.emit('entry', header, this.#stream, onunlock)

      this.#locked = true // Lock the stream to prevent further writes until done.
      this._parse(header._sizeStrike, onstreamend, header.size)
      oncontinue()
    }

    // Handle stream end for file entries.
    const onstreamend = () => {
      this.#stream = null

      this._parse(6, ontype) // Parse the next entry type.
      if (!this.#locked) oncontinue() // Continue if the stream is not locked.
    }

    // Start parsing by determining the type of the first entry.
    this._parse(6, ontype)
  }

  // Destroy the extractor and emit appropriate events.
  destroy(err) {
    if (this.#destroyed) return this // Prevent multiple destructions.
    this.#destroyed = true

    if (err) this.emit('error', err) // Emit error if there's a destruction error.
    this.emit('close') // Emit close event.
    if (this.#stream) this.#stream.emit('close') // Close the active stream if any.
    return this
  }

  // Parse the next chunk of data from the stream.
  _parse(strike, onparse, size?) {
    if (this.#destroyed) return // Do nothing if already destroyed.
    this.#offset += strike // Increment offset by the strike size.
    this.#strike = strike // Set the current strike value.
    this.#missing = size || strike // Set remaining bytes to parse.
    this.#onparse = onparse // Set the callback for the next parse step.
  }

  // Continue the parsing process by calling the stored callback.
  _continue() {
    if (this.#destroyed) return // Do nothing if already destroyed.
    const cb = this.#cb!
    this.#cb = noop
    if (this.#overflow) this._write(this.#overflow, undefined, cb) // Process overflow data.
    else cb() // Call the callback to continue parsing.
  }

  // Write data to the extractor stream.
  _write(data, _enc, cb) {
    if (this.#destroyed) return // Do nothing if already destroyed.
    if (this.#end) return cb() // Ignore writes after the end of the archive.

    const s = this.#stream
    const b = this.#buffer

    const strike = this.#strike
    const missing = this.#missing

    this.#overflow = null // Reset the overflow buffer.

    // If there's still data to process, just append it to the buffer or stream.
    if (data.length < missing) {
      this.#strike -= data.length
      this.#missing -= data.length

      if (s) {
        s.write(data, cb) // Write to the stream if it's active.
      } else {
        b.append(data) // Append data to the buffer if no stream.
        cb() // Call the callback when done.
      }

      return
    }

    // If we've reached the end of the current entry, handle accordingly.
    this.#cb = cb // Store the callback to be called later.
    this.#missing = 0 // No more data to process for this entry.

    if (missing) {
      const data2 = data.slice(0, missing)

      if (s) s.end(data2) // End the stream with the remaining data.
      else b.append(data2) // Append data to buffer if no stream.
    }

    // If there’s more data than needed for this entry, handle overflow.
    if (data.length < strike) {
      this.#strike -= data.length
      return
    }

    // Mark the entry as complete.
    this.#strike = 0

    // Store any remaining data in the overflow buffer.
    this.#overflow = data.slice(strike)

    this.#onparse() // Call the parser callback to continue processing.
  }
}

// Utility function to determine the file type from the mode.
function typeFromMode(mode) {
  const cmpValue = mode & constants.S_IFMT
  if (cmpValue === constants.S_IFREG) return 'file'
  if (cmpValue === constants.S_IFDIR) return 'directory'
  if (cmpValue === constants.S_IFLNK) return 'symlink'
  if (cmpValue === constants.S_IFSOCK) return 'socket'
  if (cmpValue === constants.S_IFBLK) return 'block-device'
  if (cmpValue === constants.S_IFCHR) return 'character-device'
  if (cmpValue === constants.S_IFIFO) return 'fifo'
  throw new Error(`unsupported file type detected from the supplied mode: ${mode}`)
}

function assertNewcFormat(buf: BufferList) {
  if (parseInt(buf.toString('ascii', 0, 2), 256) === parseInt('70707', 8)) {
    throw new Error('Old Binary format is not supported')
  }

  const magic = buf.toString('ascii', 0, 6)
  switch (magic) {
    case '070707': // Portable ASCII format
      throw new Error('Portable ASCII format is not supported')

    case '070701': // New ASCII format
      break

    case '070702': // New CRC format
      throw new Error('CRC format is not supported')

    default:
      throw new Error('Not a cpio (magic = "' + magic + '")')
  }

  buf.consume(6)
}

// Function to decode the CPIO archive header.
function newcDecoder(buf: BufferList): Header {
  const header = {
    ino: decodeHex(buf, 0),
    mode: decodeHex(buf, 8),
    uid: decodeHex(buf, 16),
    gid: decodeHex(buf, 24),
    nlink: decodeHex(buf, 32),
    mtime: new Date(decodeHex(buf, 40) * 1000),
    size: decodeHex(buf, 48),
    devmajor: decodeHex(buf, 56),
    devminor: decodeHex(buf, 64),
    rdevmajor: decodeHex(buf, 72),
    rdevminor: decodeHex(buf, 80),
    _nameLength: decodeHex(buf, 88),
    _sizeStrike: NaN,
    _nameStrike: NaN,
    linkname: '',
    name: '',
    type: '',
  }

  // Calculate padding for the entry size and name length.
  header._sizeStrike = header.size + 4 - (header.size % 4 || 4)
  header._nameStrike = header._nameLength + 4 - ((6 + headerSize + header._nameLength) % 4 || 4)
  // directory entries have a size of 0
  if (header.size) {
    header.type = typeFromMode(header.mode)
  } else {
    header.type = 'directory'
  }

  buf.consume(headerSize) // Consume the header part after decoding.
  return header // Return the decoded header.
}

// Helper function to decode hexadecimal values from the buffer.
function decodeHex(buf: BufferList, start: number) {
  const end = start + 8
  return parseInt(buf.toString('ascii', start, end), 16)
}
