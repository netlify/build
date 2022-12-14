import { listFrameworks } from '@netlify/framework-info'

import { ContextOptions, getContext } from './context.js'
import { BuildSystem, detectBuildSystems } from './detect-build-system.js'
import { detectPackageManager, PkgManagerFields } from './detect-package-manager.js'
import { getWorkspaceInfo, WorkspaceInfo } from './workspaces.js'

export type Info = {
  jsWorkspaces?: WorkspaceInfo
  packageManager?: PkgManagerFields
  frameworks: unknown[]
  buildSystems?: BuildSystem[]
}

export const getBuildInfo = async (opts: ContextOptions) => {
  const context = await getContext(opts)
  let frameworks: any[] = []

  try {
    // if the framework  detection is crashing we should not crash the build info and package-manager
    // detection
    frameworks = await listFrameworks({ projectDir: context.projectDir })
  } catch {
    // TODO: build reporting to buildbot see: https://github.com/netlify/pillar-workflow/issues/1001
    // noop
  }

  const info: Info = { frameworks }

  try {
    info.buildSystems = await detectBuildSystems(context.projectDir, context.rootDir)
  } catch (error) {
    // noop
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
