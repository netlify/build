import mapWorkspaces from '@npmcli/map-workspaces'

import type { Context } from './context.js'

export const getWorkspaceInfo = async (context: Context) => {
  if (!context.rootPackageJson.workspaces) {
    return
  }

  const workspacesMap = await mapWorkspaces({
    cwd: context.rootDir || context.projectDir,
    pkg: context.rootPackageJson,
  })

  const packages = [...workspacesMap.values()]
  // The provided project dir is a workspace package
  const isWorkspace = packages.find((path) => context.projectDir === path)

  // The project dir is a collection of workspaces itself
  const isRoot = !context.rootDir

  if (isWorkspace || isRoot) {
    return { isRoot, packages }
  }
}
