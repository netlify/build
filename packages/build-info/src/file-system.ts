import { DefaultLogger, Logger } from './logger.js'

export const enum Environment {
  Browser = 'browser',
  Node = 'node',
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

/**
 * helper function to normalize path segments for a platform independent join
 * resolves . and .. elements in a path array with directory names
 *
 * @param allowAboveRoot is used for non absolute paths to go up
 */
function normalizePathSegments(parts: string[], allowAboveRoot: boolean) {
  const res: string[] = []
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i]

    // ignore empty parts
    if (!p || p === '.') continue

    if (p === '..') {
      if (res.length && res[res.length - 1] !== '..') {
        res.pop()
      } else if (allowAboveRoot) {
        res.push('..')
      }
    } else {
      res.push(p)
    }
  }

  return res
}

/** A platform independent version of path.normalize()  */
export function normalize(path: string): string {
  const isAbsolute = path.startsWith('/')
  const trailingSlash = path && path[path.length - 1] === '/'

  // Normalize the path
  path = normalizePathSegments(path.split('/'), !isAbsolute).join('/')

  if (!path && !isAbsolute) {
    path = '.'
  }
  if (path && trailingSlash) {
    path += '/'
  }

  return `${isAbsolute ? '/' : ''}${path}`
}

/** A platform independent version of path.join() */
export function join(...segments: string[]): string {
  let path = ''
  for (let i = 0, max = segments.length; i < max; i++) {
    if (typeof segments[i] !== 'string') {
      throw new TypeError('Arguments to join must be strings')
    }
    // replace all backslashes to forward slashes
    const segment = segments[i].replace(/\\/gm, '/')
    if (segment) {
      if (!path.length) {
        path += segment
      } else {
        path += '/' + segment
      }
    }
  }
  return normalize(path)
}

export abstract class FileSystem {
  logger: Logger = new DefaultLogger('error')

  /** The current working directory will be set by the project */
  cwd = '/'

  abstract getEnvironment(): Environment

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

    if (absoluteTo.startsWith(absoluteFrom)) {
      // lazily matches a slash afterwards if it's a directory
      return absoluteTo.substring(absoluteFrom.length).replace(/^\//, '')
    }

    const fromParts = this.join(absoluteFrom).split('/')
    const toParts = this.join(absoluteTo).split('/')
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
    const result = fromUp > 0 ? Array<string>(up).fill('..') : []

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
  async readJSON<V = Record<string, unknown>>(path: string, options: { fail?: boolean } = {}): Promise<Partial<V>> {
    try {
      return JSON.parse(await this.readFile(path))
    } catch (error) {
      if (options.fail) {
        throw error
      }

      let message = `Could not parse JSON file ${path}`
      if (error instanceof Error) {
        message += `\n${error.name}: ${error.message}\n${error.stack}`
      }
      this.logger.error(message)
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
