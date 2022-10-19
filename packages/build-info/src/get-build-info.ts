import { listFrameworks } from '@netlify/framework-info'

import { ContextOptions, getContext } from './context.js'
import { detectPackageManager, PkgManagerFields } from './detect-package-manager.js'
import { getWorkspaceInfo, WorkspaceInfo } from './workspaces.js'

export type Info = {
  jsWorkspaces?: WorkspaceInfo
  packageManager?: PkgManagerFields
  frameworks: unknown[]
}

export const getBuildInfo = async (opts: ContextOptions) => {
  const context = await getContext(opts)

  const info: Info = {
    frameworks: await listFrameworks({ projectDir: context.projectDir }),
  }

  const workspaceInfo = await getWorkspaceInfo(context)
  if (workspaceInfo) {
    info.jsWorkspaces = workspaceInfo
  }

  if (Object.keys(context.rootPackageJson).length > 0) {
    info.packageManager = await detectPackageManager(context.projectDir)
  }

  return info
}
