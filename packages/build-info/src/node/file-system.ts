import { promises as fs } from 'fs'
import { basename, dirname, isAbsolute, join, relative, resolve } from 'path'

import { up as walkUp } from 'empathic/walk'

import { DirType, Environment, FileSystem, findUpOptions } from '../file-system.js'

export class NodeFS extends FileSystem {
  constructor() {
    super()
    this.cwd = process.cwd()
  }

  getEnvironment() {
    return Environment.Node
  }

  isAbsolute(path: string): boolean {
    return isAbsolute(path)
  }

  dirname(path: string): string {
    return dirname(path)
  }

  resolve(...paths: string[]): string {
    return resolve(...paths)
  }

  relative(from: string, to: string): string {
    return relative(from, to)
  }

  basename(path: string): string {
    return basename(path)
  }

  join(...segments: string[]): string {
    return join(...segments)
  }

  async fileExists(path: string) {
    try {
      await fs.stat(resolve(path))
      return true
    } catch {
      return false
    }
  }

  /** Get a list of directory entries */
  async readDir(path: string): Promise<string[]>
  async readDir(path: string, withFileTypes: true): Promise<Record<string, DirType>>
  async readDir(path: string, withFileTypes?: true): Promise<Record<string, DirType> | string[]> {
    try {
      if (!withFileTypes) {
        return fs.readdir(resolve(path))
      }
      const result = await fs.readdir(resolve(path), { withFileTypes: true })
      return result.reduce((prev, cur) => ({ ...prev, [cur.name]: cur.isDirectory() ? 'directory' : 'file' }), {})
    } catch {
      return []
    }
  }

  async readFile(path: string): Promise<string> {
    return (await fs.readFile(resolve(path), 'utf-8')).toString()
  }

  /** Node implementation of finding a file or directory by walking up parent directories. */
  async findUp(name: string | string[], options: findUpOptions = {}): Promise<string | undefined> {
    const walkOptions = {
      cwd: options.cwd,
      last: options.stopAt,
    }
    const names = typeof name === 'string' ? [name] : name
    for (const dir of walkUp('.', walkOptions)) {
      for (const potentialName of names) {
        const filePath = join(dir, potentialName)
        try {
          const stats = await fs.stat(filePath)
          const type = stats.isFile() ? 'file' : 'directory'
          if (options.type === type || !options.type) {
            return filePath
          }
        } catch {
          // ignore
        }
      }
    }
  }

  /** Node implementation of finding files or directories by walking up parent directories. */
  async findUpMultiple(name: string | readonly string[], options: findUpOptions = {}): Promise<string[]> {
    const results: string[] = []
    const normalisedNames = typeof name === 'string' ? [name] : name
    const walkOptions = {
      cwd: options.cwd,
      last: options.stopAt,
    }
    for (const dir of walkUp(options.cwd ?? '.', walkOptions)) {
      for (const potentialName of normalisedNames) {
        const filePath = join(dir, potentialName)
        try {
          const stats = await fs.stat(filePath)
          const type = stats.isFile() ? 'file' : 'directory'
          if (options.type === type || !options.type) {
            results.push(filePath)
          }
        } catch {
          // ignore
        }
      }
    }
    return results
  }
}
