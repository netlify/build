import { existsSync, readFileSync } from 'fs'
import { join, relative } from 'path'

import mapWorkspaces from '@npmcli/map-workspaces'
import { PackageJson } from 'read-pkg'
import { parse } from 'yaml'

import type { Context } from './context.js'
import { PkgManager, PkgManagerFields } from './detect-package-manager.js'

export type WorkspaceInfo = {
  /** if we are in the current workspace root or not */
  isRoot: boolean
  /** the workspace root directory */
  rootDir: string
  /** list of relative package paths inside the workspace */
  packages: string[]
}

/**
 * Get a list of globs about all the packages inside a pnpm workspace
 * https://pnpm.io/pnpm-workspace_yaml
 */
export const detectPnpmWorkspaceGlobs = (rootDir: string): string[] => {
  const workspaceFile = join(rootDir, 'pnpm-workspace.yaml')
  if (!existsSync(workspaceFile)) {
    return []
  }

  const { packages } = parse(readFileSync(workspaceFile, 'utf-8'))
  return packages
}

export const detectNpmOrYarnWorkspaceGlobs = (pkgJson: PackageJson): string[] => {
  if (Array.isArray(pkgJson.workspaces)) {
    return pkgJson.workspaces
  }
  if (typeof pkgJson.workspaces === 'object') {
    return pkgJson.workspaces.packages
  }
  return []
}

/**
 * If it's a javascript workspace (npm, pnpm, yarn) it will retrieve a list of all
 * relative package paths and will indicate if it's the root of the workspace
 */
export const getWorkspaceInfo = async (
  packageManager: PkgManagerFields,
  context: Context,
): Promise<undefined | WorkspaceInfo> => {
  const rootDir = context.rootDir || context.projectDir

  const workspaceGlobs =
    packageManager.name === PkgManager.PNPM
      ? detectPnpmWorkspaceGlobs(rootDir)
      : detectNpmOrYarnWorkspaceGlobs(context.rootPackageJson)

  if (workspaceGlobs.length === 0) {
    return
  }

  const workspacesMap: Map<string, string> = await mapWorkspaces({
    cwd: rootDir,
    pkg: { workspaces: workspaceGlobs },
  })

  // make paths relative
  const packages = [...workspacesMap.values()].map((p) => relative(rootDir, p))

  // The provided project dir is a workspace package and not a different directory
  // in a mono repository that is not part inside the npm workspaces
  const isWorkspace = packages.find((path) => context.projectDir === join(rootDir, path))

  // The project dir is a collection of workspaces itself
  const isRoot = !context.rootDir

  if (isWorkspace || isRoot) {
    return {
      isRoot,
      packages,
      rootDir,
    }
  }
}
