import { readFileSync } from 'fs'
import { basename } from 'path'

import { findUp, findUpMultiple } from 'find-up'

// the value of the enum should match the values that can be specified inside the `packageManager` field of a `package.json`
const enum PkgManager {
  Yarn = 'yarn',
  PNPM = 'pnpm',
  NPM = 'npm',
}

export type PkgManagerFields = {
  /** The package managers name that is used for logging */
  name: string
  /** The package managers install command */
  installCommand: string
  /** The lock file a package manager is using */
  lockFile: string
  /** Environment variable that can be used to force the usage of a package manager even though there is no lock file or a different lock file */
  forceEnvironment?: string
  /** Flags that should be used for running the install command */
  installFlags?: string[]
  /** A list of all cache locations for the package manager */
  cacheLocations?: string[]
}

/** The definition of all available package managers */
const AVAILABLE_PACKAGE_MANAGERS: Record<PkgManager, PkgManagerFields> = {
  [PkgManager.Yarn]: {
    name: 'yarn',
    installCommand: 'yarn install',
    lockFile: 'yarn.lock',
    forceEnvironment: 'NETLIFY_USE_YARN',
  },
  [PkgManager.PNPM]: {
    name: 'pnpm',
    installCommand: 'pnpm install',
    lockFile: 'pnpm-lock.yaml',
    forceEnvironment: 'NETLIFY_USE_PNPM',
  },
  [PkgManager.NPM]: {
    name: 'npm',
    installCommand: 'npm install',
    lockFile: 'package-lock.json',
  },
}

/**
 * generate a map out of key is lock file and value the package manager
 * this is to reduce the complexity in loops
 */
const lockFileMap = Object.values(AVAILABLE_PACKAGE_MANAGERS).reduce(
  (cur, pkgManager) => ({ ...cur, [pkgManager.lockFile]: pkgManager }),
  {} as Record<string, PkgManagerFields>,
)

/**
 * Detects the used package manager based on
 *  - a set environment variable that forces the usage
 *  - a lock file that is present in this directory or up in the tree for workspaces
 * @param cwd The current process working directory of the build
 * @returns The package manager that was detected
 */
export const detectPackageManager = async (cwd?: string): Promise<PkgManagerFields> => {
  // the package manager can be enforced via an environment variable as well
  for (const pkgManager of Object.values(AVAILABLE_PACKAGE_MANAGERS)) {
    if (pkgManager.forceEnvironment && process.env[pkgManager.forceEnvironment] === 'true') {
      return pkgManager
    }
  }

  // find the correct lock file the tree up
  const lockFilePath = await findUp(Object.keys(lockFileMap), { cwd })
  // if we found a lock file and the usage is not prohibited through an environment variable
  // return the found package manager
  if (lockFilePath) {
    const lockFile = basename(lockFilePath)
    const pkgM = lockFileMap[lockFile]
    // check if it not got disabled
    if (!(pkgM.forceEnvironment && process.env[pkgM.forceEnvironment] === 'false')) {
      return pkgM
    }
  }

  const pkgPaths = await findUpMultiple('package.json', { cwd })
  for (const pkgPath of pkgPaths) {
    const { packageManager } = JSON.parse(readFileSync(pkgPath, 'utf-8'))
    if (packageManager) {
      //
      const [parsed] = packageManager.split('@')
      if (AVAILABLE_PACKAGE_MANAGERS[parsed]) {
        return AVAILABLE_PACKAGE_MANAGERS[parsed]
      }
    }
  }

  // always default to npm
  // TODO: add some reporting here to log that we fall backed
  return AVAILABLE_PACKAGE_MANAGERS[PkgManager.NPM]
}
