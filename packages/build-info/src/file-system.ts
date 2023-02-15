class DefaultLogger {
  debug(...data: any[]) {
    // TODO: add reporting
    console.debug(...data)
  }

  log(...data: any[]) {
    console.log(...data)
  }

  error(...data: any[]) {
    // TODO: on error add reporting
    console.error(...data)
  }
}

export class NoopLogger {
  debug() {
    /** noop */
  }
  log() {
    /** noop */
  }
  error() {
    /** noop */
  }
}

export type DirType = 'directory' | 'file'

export type TextFile = { content: string; type: 'text' }
export type JSONFile<T = Record<string, any>> = { content: T; type: 'json' }
export type TOMLFile = { content: string; type: 'toml' }

export type File = TextFile | JSONFile | TOMLFile

export type findUpOptions = {
  cwd?: string
  type?: DirType
  stopAt?: string
}

export abstract class FileSystem {
  logger = new DefaultLogger()

  /**
   * This is a in memory representation of the parsed files
   * The keys are always stored in posix style
   * If the value is null then the file did not get read up in memory yet.
   * If the value is a string it already got read up in mem.
   */
  files = new Map<string, File | null>()
  /** The current working directory will be set by the project */
  cwd = '/'

  abstract fileExists(path: string): Promise<boolean>

  abstract readDir(path: string): Promise<string[]>
  abstract readDir(path: string, withFileTypes: true): Promise<Record<string, DirType>>
  abstract readDir(path: string, withFileTypes?: true): Promise<Record<string, DirType> | string[]>

  abstract readFile(path: string): Promise<string>

  /** resolves a path to an absolute path */
  abstract resolve(...paths: string[]): string
  /** check if a path is an absolute path */
  abstract isAbsolute(path: string): boolean

  /** returns the last portion of a path */
  basename(path: string): string {
    return this.join(path).split('/').pop() || ''
  }

  /** returns the directory name of a path */
  dirname(path: string): string {
    const parts = this.join(path).split('/')
    parts.pop()

    // Preserve the initial slash if there was one.
    if (parts.length === 1 && parts[0] === '') {
      return '/'
    }
    return parts.join('/')
  }

  /** A platform independent version of path.join() */
  join(...segments: string[]): string {
    let parts: string[] = []
    for (let i = 0, max = segments.length; i < max; i++) {
      // split the segments to parts by all kind of separator (forward and backward)
      parts = parts.concat(segments[i].split(/[\\/]/g))
    }

    // resolve .. inside path segments
    const resolvedParts: string[] = []
    for (let i = 0, max = parts.length; i < max; i++) {
      const part = parts[i]
      // Remove leading and trailing slashes
      // Also remove "." segments
      if (!part || part === '.') continue
      // Interpret ".." to pop the last segment
      if (part === '..') {
        resolvedParts.pop()
      } else {
        resolvedParts.push(part)
      }
    }
    // Preserve the initial slash if there was one.
    if (parts[0] === '') {
      resolvedParts.unshift('')
    }

    return resolvedParts.join('/') || (resolvedParts.length ? '/' : '.')
  }

  /** adds a file to the file map */
  setFile(path: string, content: File): void {
    this.files.set(path, content)
  }

  /** get a file from the file map */
  getFile(path: string): File | null {
    return this.files.get(path) || null
  }

  /** get a json file from the file map */
  getJSONFile<T = Record<string, any>>(path: string): JSONFile<T> | null {
    const file = this.files.get(path) || null
    if (file?.type === 'json') {
      return file as JSONFile<T>
    }
    return null
  }

  /** get a toml file from the file map */
  getTOMLFile(path: string): TOMLFile | null {
    const file = this.files.get(path) || null
    if (file?.type === 'toml') {
      return file
    }
    return null
  }

  /** Checks if a file is already in our in memory representation */
  hasFile(path): boolean {
    const resolvedPath = path
    const file = this.files.get(resolvedPath)

    return Boolean(file?.content)
  }

  /** Gracefully reads a file as JSON and parses it */
  async readJSON<V = Record<string, unknown>>(path: string): Promise<Partial<V>> {
    try {
      const content = JSON.parse(await this.readFile(path))
      this.files.set(path, { content, type: 'json' })
      return content
    } catch (error) {
      this.logger.error(`Could not parse JSON file ${path}\n${error}`)
      return {}
    }
  }

  /** Find a file or directory by walking up parent directories. */
  async findUp(name: string | readonly string[], options: findUpOptions = {}): Promise<string | undefined> {
    let startDir = this.resolve(options.cwd || this.cwd)

    // function for a recursive call
    const readUp = async (): Promise<string | undefined> => {
      const entries = await this.readDir(startDir, true)
      const found = Object.entries(entries).find(([entry, dirType]) => {
        if ((typeof name === 'string' && entry === name) || (Array.isArray(name) && name.includes(entry))) {
          if (options.type) {
            if (options.type === dirType) {
              return entry
            }
          }
          return entry
        }
      })

      // either found something or reached the root and nothing found
      if (found?.[0]) {
        return this.join(startDir, found[0])
      }

      if (startDir === '/' || (options.stopAt && this.resolve(options.stopAt) === startDir)) {
        return
      }

      startDir = this.join(startDir, '..')
      // recursive call to walk up
      return readUp()
    }

    return readUp()
  }

  /** Find files or directories by walking up parent directories. */
  async findUpMultiple(name: string | readonly string[], options: findUpOptions = {}): Promise<string[]> {
    let startDir = this.resolve(options.cwd || this.cwd)
    const found: string[] = []

    // function for a recursive call
    const readUp = async (): Promise<string[]> => {
      const entries = await this.readDir(startDir, true)
      for (const [entry, dirType] of Object.entries(entries)) {
        if ((typeof name === 'string' && entry === name) || (Array.isArray(name) && name.includes(entry))) {
          if ((options.type && options.type === dirType) || !options.type) {
            found.push(this.resolve(startDir, entry))
          }
        }
      }

      if (startDir === '/' || (options.stopAt && this.resolve(options.stopAt) === startDir)) {
        return found
      }

      startDir = this.join(startDir, '..')
      // recursive call to walk up
      return readUp()
    }

    return readUp()
  }
}
