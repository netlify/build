import { parse, type PackageJsonLike } from 'lockparse'
import type { PackageJson } from 'read-pkg'

import { NPM_BUILD_SCRIPTS, NPM_DEV_SCRIPTS } from '../get-commands.js'

import { BaseBuildTool, type Command } from './build-system.js'

const PACKAGE_NAME = 'vite-plus'

/** Lock files `lockparse` can read (bun.lockb is binary and unsupported) */
const LOCK_FILES = ['package-lock.json', 'npm-shrinkwrap.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lock']

export class VitePlus extends BaseBuildTool {
  id = 'vite-plus'
  name = 'Vite Plus'
  runFromRoot = true

  logo = {
    default: '/logos/vite-plus/icon-color-light.svg',
    light: '/logos/vite-plus/icon-color-light.svg',
    dark: '/logos/vite-plus/icon-color-dark.svg',
  }

  /** Retrieves a list of possible commands for a package */
  async getCommands(packagePath: string): Promise<Command[]> {
    const { scripts, name } = await this.project.fs.readJSON<PackageJson>(
      this.project.resolveFromPackage(packagePath, 'package.json'),
    )

    if (name && scripts && Object.values(scripts).length) {
      return Object.keys(scripts).map((target) => {
        let type: Command['type'] = 'unknown'

        if (NPM_DEV_SCRIPTS.includes(target)) {
          type = 'dev'
        }

        if (NPM_BUILD_SCRIPTS.includes(target)) {
          type = 'build'
        }

        return {
          type,
          command: `vp run --filter ${name} ${target}`,
        }
      })
    }
    return []
  }

  /**
   * Vite Plus has no unique config file (vite.config.* is shared with plain Vite), so
   * it's detected through a dependency on the `vite-plus` package, declared anywhere
   * from the base directory up to the repository root.
   */
  async detect(): Promise<this | undefined> {
    const pkgJsonPaths = await this.project.fs.findUpMultiple('package.json', {
      cwd: this.project.baseDirectory,
      stopAt: this.project.root,
    })

    for (const pkgJsonPath of pkgJsonPaths) {
      const pkgJson = await this.project.fs.readJSON<PackageJson>(pkgJsonPath)
      const declared = pkgJson.devDependencies?.[PACKAGE_NAME] ?? pkgJson.dependencies?.[PACKAGE_NAME]
      if (declared) {
        // Unlike other build systems, report the exact locked version when resolvable:
        // consumers install the vp CLI version matching the project's lock file.
        // Note that, since vite-plus is also used as a package manager (... wrapper), we can't just *install* first and
        // then read the installed version 🔁.
        this.version = (await this.resolveLockedVersion(pkgJson, pkgJsonPath)) ?? declared
        return this
      }
    }
  }

  private async resolveLockedVersion(pkgJson: Partial<PackageJson>, pkgJsonPath: string): Promise<string | undefined> {
    const lockfilePath = await this.project.fs.findUp(LOCK_FILES, {
      cwd: this.project.fs.dirname(pkgJsonPath),
      stopAt: this.project.root,
    })
    if (!lockfilePath) {
      return undefined
    }

    const content = await this.project.fs.gracefullyReadFile(lockfilePath)
    if (!content) {
      return undefined
    }

    try {
      const fileName = this.project.fs.basename(lockfilePath)
      // npm-shrinkwrap.json shares the package-lock.json format
      const typeOrFileName = fileName === 'npm-shrinkwrap.json' ? 'npm' : fileName
      const { packages } = await parse(content, typeOrFileName, pkgJson as PackageJsonLike)
      return packages.find((pkg) => pkg.name === PACKAGE_NAME)?.version
    } catch {
      // An unparsable lock file shouldn't fail detection; fall back to the declared range
      return undefined
    }
  }
}
