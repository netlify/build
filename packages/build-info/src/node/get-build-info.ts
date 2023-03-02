import { listFrameworks } from '@netlify/framework-info'

import { Logger } from '../file-system.js'
import { report } from '../metrics.js'
import { PkgManagerFields } from '../package-managers/detect-package-manager.js'
import { Project } from '../project.js'
import { WorkspaceInfo } from '../workspaces/detect-workspace.js'

import { NodeFS } from './file-system.js'

export type Info = {
  jsWorkspaces: WorkspaceInfo | null
  packageManager: PkgManagerFields | null
  frameworks: unknown[]
  buildSystems: {
    name: string
    version?: string | undefined
  }[]
}

/** A noop logger that is used to not log anything (we use the stdout for parsing the json output) */
export class NoopLogger implements Logger {
  debug() {
    /** noop */
  }
  log() {
    /** noop */
  }
  error() {
    /** noop */
  }
  info() {
    /** noop */
  }
  warn() {
    /** noop */
  }
}

/** Get the build info object that is used inside buildbot */
export async function getBuildInfo(
  config: {
    projectDir?: string
    rootDir?: string
    featureFlags?: Record<string, boolean>
  } = { featureFlags: {} },
): Promise<Info> {
  const fs = new NodeFS()
  // prevent logging in output as we use the stdout to capture the json
  fs.logger = new NoopLogger()
  const project = new Project(fs, config.projectDir, config.rootDir)
    .setEnvironment(process.env)
    .setNodeVersion(process.version)
  let frameworks: any[] = []
  try {
    // if the framework  detection is crashing we should not crash the build info and package-manager detection
    frameworks = await listFrameworks({ projectDir: project.baseDirectory })
  } catch (error) {
    report(error)
  }

  const info: Info = {
    packageManager: await project.detectPackageManager(),
    jsWorkspaces: await project.detectWorkspaces(),
    frameworks,
    buildSystems: await project.detectBuildSystem(),
  }

  // const pkgJSONPath = await project.getPackageJSON()
  // // only if we find a root package.json we know this is a javascript workspace
  // if (Object.keys(pkgJSONPath).length) {
  //   info.packageManager = await project.detectPackageManager()
  //   const workspaceInfo = await project.detectWorkspaces()
  //   if (workspaceInfo) {
  //     info.jsWorkspaces = workspaceInfo
  //   }
  // }

  return info
}
