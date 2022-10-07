import mapWorkspaces from '@npmcli/map-workspaces'

export const getWorkspaceInfo = async function ({ rootPackageJson, projectDir, rootDir }) {
  if (!rootPackageJson.workspaces) {
    return
  }

  const workspacesMap = await mapWorkspaces({
    cwd: rootDir || projectDir,
    pkg: rootPackageJson,
  })

  const packages = [...workspacesMap.values()]
  // The provided project dir is a workspace package
  const isWorkspace = packages.find((path) => projectDir === path)

  // The project dir is a collection of workspaces itself
  const isRoot = !rootDir

  if (isWorkspace || isRoot) {
    return { isRoot, packages }
  }
}
