import { join, relative } from 'path'

import mapWorkspaces from '@npmcli/map-workspaces'

import type { Context } from './context.js'

export type WorkspaceInfo = {
  /** if we are in the current workspace root or not */
  isRoot: boolean
  /** the workspace root directory */
  rootDir: string
  /** list of relative package paths inside the workspace */
  packages: string[]
}

/**
 * If it's a javascript workspace (npm, pnpm, yarn) it will retrieve a list of all
 * relative package paths and will indicate if it's the root of the workspace
 */
export const getWorkspaceInfo = async (context: Context): Promise<undefined | WorkspaceInfo> => {
  if (!context.rootPackageJson.workspaces) {
    return
  }

  const rootDir = context.rootDir || context.projectDir
  const workspacesMap: Map<string, string> = await mapWorkspaces({
    cwd: rootDir,
    pkg: context.rootPackageJson,
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
