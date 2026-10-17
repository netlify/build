import type { DirType } from '../file-system.js'

import { Accuracy, BaseFramework, Category, DetectedFramework, Detection, Framework } from './framework.js'

const CONFIG_FILES = ['config.json', 'config.toml', 'config.yaml', 'hugo.toml', 'hugo.yaml', 'hugo.json']
const CONFIG_EXTENSIONS = ['.json', '.toml', '.yaml', '.yml']

export class Hugo extends BaseFramework implements Framework {
  readonly id = 'hugo'
  name = 'Hugo'
  configFiles = CONFIG_FILES
  category = Category.SSG

  dev = {
    command: 'hugo server -w',
    port: 1313,
    pollingStrategies: [{ name: 'TCP' }],
  }

  build = {
    command: 'hugo',
    directory: 'public',
  }

  logo = {
    default: '/logos/hugo/default.svg',
    light: '/logos/hugo/default.svg',
    dark: '/logos/hugo/default.svg',
  }

  async detect(): Promise<DetectedFramework | undefined> {
    await super.detect()

    this.detected ??= await this.detectConfigDirectory()

    if (this.detected) {
      return this as DetectedFramework
    }
  }

  /** Hugo can split its configuration into a `config/_default` directory instead of a single file at the site root */
  private async detectConfigDirectory(): Promise<Detection | undefined> {
    const configDirs = await this.project.fs.findUpMultiple('config', {
      cwd: this.path ?? this.project.baseDirectory,
      stopAt: this.project.root,
      type: 'directory',
    })

    for (const configDir of configDirs) {
      const defaultDir = this.project.fs.join(configDir, '_default')
      const configName = await this.findConfigFile(defaultDir)

      if (configName) {
        return {
          accuracy: Accuracy.ConfigOnly,
          config: this.project.fs.join(defaultDir, configName),
          configName,
        }
      }
    }
  }

  private async findConfigFile(dir: string): Promise<string | undefined> {
    let entries: Record<string, DirType> = {}
    try {
      entries = await this.project.fs.readDir(dir, true)
    } catch {
      // the browser file system throws for a directory that does not exist
      return
    }

    const files = Object.entries(entries)
      .filter(([, type]) => type === 'file')
      .map(([name]) => name)

    return (
      CONFIG_FILES.find((file) => files.includes(file)) ??
      files.find((file) => CONFIG_EXTENSIONS.some((extension) => file.endsWith(extension)))
    )
  }
}
