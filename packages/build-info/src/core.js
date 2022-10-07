import { getFrameworks } from './frameworks.js'
import { getWorkspaceInfo } from './workspaces.js'

export const buildInfo = async function (context) {
  const workspaceInfo = await getWorkspaceInfo(context)
  const jsWorkspaces = workspaceInfo ? { jsWorkspaces: workspaceInfo } : {}
  const frameworks = await getFrameworks(context)
  return { ...jsWorkspaces, frameworks }
}
