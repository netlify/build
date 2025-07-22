import { DirType, Environment, FileSystem } from '../file-system.js'

/** A sample implementation of a GitHub provider */
export class GithubProvider {
  constructor(
    public repo: string,
    public branch?: string,
  ) {}

  async dir(filePath = ''): Promise<{ path: string; type: 'file' | 'dir' }[]> {
    let path = `/repos/${this.repo}/contents${filePath}`
    if (this.branch) {
      path += `?ref=${this.branch}`
    }
    return this.request(path)
  }

  async read(filePath: string): Promise<string> {
    const headers = { Accept: 'application/vnd.github.VERSION.raw' }
    let path = `/repos/${this.repo}/contents${filePath}`
    if (this.branch) {
      path += `?ref=${this.branch}`
    }
    return this.request(path, headers)
  }

  private async request(path: string, headers: Record<string, string> = {}) {
    const response = await fetch(new URL(path, `https://api.github.com`).href, { headers })
    if (response.headers?.get('Content-Type')?.match(/json/)) {
      const json = await response.json()
      if (!response.ok) {
        throw new Error(JSON.stringify(json))
      }
      return json
    }
    return response.text()
  }
}

/** A sample implementation of a web based file system that fetches from GitHub */
export class WebFS extends FileSystem {
  constructor(public git: GithubProvider) {
    super()
  }

  getEnvironment() {
    return Environment.Browser
  }

  isAbsolute(path: string): boolean {
    return path.startsWith('/')
  }

  resolve(...paths: string[]): string {
    const path = this.join(...paths)
    return this.isAbsolute(path) ? path : this.join(this.cwd, path)
  }

  async fileExists(path: string): Promise<boolean> {
    try {
      await this.readFile(path)
      return true
    } catch {
      return false
    }
  }

  /** Get a list of directory entries */
  async readDir(path: string): Promise<string[]>
  async readDir(path: string, withFileTypes: true): Promise<Record<string, DirType>>
  async readDir(path: string, withFileTypes?: true): Promise<Record<string, DirType> | string[]> {
    const result = await this.git.dir(this.resolve(path))
    if (!withFileTypes) {
      return result.map(({ path }) => path)
    }

    return result.reduce((prev, cur) => ({ ...prev, [cur.path]: cur.type === 'dir' ? 'directory' : 'file' }), {})
  }

  async readFile(path: string): Promise<string> {
    return this.git.read(this.resolve(path))
  }
}
