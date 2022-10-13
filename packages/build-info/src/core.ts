import { listFrameworks } from '@netlify/framework-info'

import type { Context } from './context.js'
import { getWorkspaceInfo } from './workspaces.js'

export const buildInfo = async function (context: Context) {
  const workspaceInfo = await getWorkspaceInfo(context)
  const jsWorkspaces = workspaceInfo ? { jsWorkspaces: workspaceInfo } : {}
  const frameworks = await listFrameworks({ projectDir: context.projectDir })

  return { ...jsWorkspaces, frameworks }
}
