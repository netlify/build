import { promises as fs } from 'fs'
import { isAbsolute, resolve } from 'path'

import { findUp, findUpMultiple } from 'find-up'

import { DirType, FileSystem, findUpOptions } from '../file-system.js'

export class NodeFS extends FileSystem {
  constructor() {
    super()
    this.cwd = process.cwd()
  }

  isAbsolute(path: string): boolean {
    return isAbsolute(path)
  }

  resolve(...paths: string[]): string {
    return resolve(...paths)
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
    const storedFile = this.getFile(path)
    // no need to read again (just use the already stored file)
    if (storedFile?.type === 'text') {
      return storedFile.content
    }
    return (await fs.readFile(resolve(path), 'utf-8')).toString()
  }

  /** Node implementation of finding a file or directory by walking up parent directories. */
  findUp(name: string | readonly string[], options: findUpOptions = {}): Promise<string | undefined> {
    return findUp(name, options)
  }

  /** Node implementation of finding files or directories by walking up parent directories. */
  findUpMultiple(name: string | readonly string[], options: findUpOptions = {}): Promise<string[]> {
    return findUpMultiple(name, options)
  }
}
