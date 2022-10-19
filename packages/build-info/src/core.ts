import { join } from 'path'

import { listFrameworks } from '@netlify/framework-info'

import type { Context } from './context.js'
import { detectPackageManager } from './detect-package-manager.js'
import { getWorkspaceInfo } from './workspaces.js'

export const buildInfo = async function (context: Context) {
  const workspaceInfo = await getWorkspaceInfo(context)
  const jsWorkspaces: any = workspaceInfo ? { jsWorkspaces: workspaceInfo } : {}
  const frameworks = await listFrameworks({ projectDir: context.projectDir })

  if (Object.keys(context.rootPackageJson).length > 0) {
    jsWorkspaces.packageManager = await detectPackageManager(context.projectDir)
  }

  return { ...jsWorkspaces, frameworks }
}
