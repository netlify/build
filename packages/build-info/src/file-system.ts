export interface Logger {
  debug(...any: any[]): void
  log(...any: any[]): void
  error(...any: any[]): void
  info(...any: any[]): void
  warn(...any: any[]): void
}

class DefaultLogger implements Logger {
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

  info(...data: any[]) {
    // TODO: on error add reporting
    console.info(...data)
  }

  warn(...data: any[]) {
    // TODO: on error add reporting
    console.warn(...data)
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

/** A platform independent version of path.join() */
export function join(...segments: string[]): string {
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

export abstract class FileSystem {
  logger: Logger = new DefaultLogger()

  /** The current working directory will be set by the project */
  cwd = '/'

  abstract getEnvironment(): 'browser' | 'node'

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

  /** returns the relative path from to based on the current working directory */
  relative(from: string, to: string): string {
    const absoluteFrom = this.isAbsolute(from) ? from : this.join(this.cwd, from)
    const absoluteTo = this.isAbsolute(to) ? to : this.join(this.cwd, to)

    // if the paths are equal return an empty string
    if (absoluteFrom === absoluteTo) {
      return ''
    }

    const matching: string[] = []

    // split by / excluding the starting slash
    const fromParts = this.join(absoluteFrom).split(/(?<!^)\//gm)
    const toParts = this.join(absoluteTo).split(/(?<!^)\//gm)
    for (let i = 0, max = toParts.length; i < max; i++) {
      if (toParts[i] === fromParts?.[i]) {
        matching.push(toParts[i])
      } else {
        break
      }
    }

    // calculate how many dirs we need to go up from the to path
    const toUp = toParts.length - matching.length
    const fromUp = fromParts.length - matching.length
    // the max we have to go up
    const up = Math.max(toUp, fromUp)

    // if we have something from the 'from' to go up the max difference
    const result = fromUp > 0 ? [...new Array<string>(up).fill('..')] : []

    // if we have some parts left add them to the going up
    if (toUp > 0) {
      result.push(...toParts.slice(-toUp))
    }

    return result.join('/')
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
    return join(...segments)
  }

  /** Gracefully reads the file and returns null if it does not exist */
  async gracefullyReadFile(path: string): Promise<string | null> {
    try {
      return await this.readFile(path)
    } catch {
      return null
    }
  }

  /** Gracefully reads a file as JSON and parses it */
  async readJSON<V = Record<string, unknown>>(path: string): Promise<Partial<V>> {
    try {
      return JSON.parse(await this.readFile(path))
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
