import { listFrameworks } from '@netlify/framework-info'

import { ContextOptions, getContext } from './context.js'
import { BuildSystem, detectBuildSystems } from './detect-build-system.js'
import { detectPackageManager, PkgManagerFields } from './detect-package-manager.js'
import { getWorkspaceInfo, WorkspaceInfo } from './workspaces.js'

export type Info = {
  jsWorkspaces?: WorkspaceInfo
  packageManager?: PkgManagerFields
  frameworks: unknown[]
  buildSystems: BuildSystem[]
}

export const getBuildInfo = async (opts: ContextOptions) => {
  const context = await getContext(opts)
  const info: Info = {
    frameworks: await listFrameworks({ projectDir: context.projectDir }),
    buildSystems: detectBuildSystems(context.projectDir, context.rootDir),
  }

  // only if we find a root package.json we know this is a javascript workspace
  if (Object.keys(context.rootPackageJson).length > 0) {
    info.packageManager = await detectPackageManager(context.projectDir, context.rootDir)
    const workspaceInfo = await getWorkspaceInfo(info.packageManager, context)
    if (workspaceInfo) {
      info.jsWorkspaces = workspaceInfo
    }
  }

  return info
}
