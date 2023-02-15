import { listFrameworks } from '@netlify/framework-info'

import { NoopLogger } from '../file-system.js'
import { PkgManagerFields } from '../package-managers/detect-package-manager.js'
import { Project } from '../project.js'
import { WorkspaceInfo } from '../workspaces/detect-workspace.js'

import { NodeFS } from './file-system.js'

export type Info = {
  jsWorkspaces?: WorkspaceInfo
  packageManager?: PkgManagerFields
  frameworks: unknown[]
  buildSystems?: {
    name: string
    version?: string | undefined
  }[]
}

/** Get the build info object that is used inside buildbot */
export async function getBuildInfo(projectDir?: string, rootDir?: string): Promise<Info> {
  const fs = new NodeFS()
  // prevent logging in output as we use the stdout to capture the json
  fs.logger = new NoopLogger()
  const project = new Project(fs, projectDir, rootDir)
  project.setEnvironment(process.env)
  let frameworks: any[] = []
  try {
    // if the framework  detection is crashing we should not crash the build info and package-manager detection
    frameworks = await listFrameworks({ projectDir: project.baseDirectory })
  } catch {
    // TODO: build reporting to buildbot see: https://github.com/netlify/pillar-workflow/issues/1001
    // noop
  }

  const info: Info = {
    frameworks,
    buildSystems: await project.detectBuildSystem(),
  }

  const pkgJSONPath = await project.getPackageJSON()
  // only if we find a root package.json we know this is a javascript workspace
  if (Object.keys(pkgJSONPath).length) {
    info.packageManager = await project.detectPackageManager()
    const workspaceInfo = await project.detectWorkspaces()
    if (workspaceInfo) {
      info.jsWorkspaces = workspaceInfo
    }
  }

  return info
}
