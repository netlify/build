import { Client } from '@bugsnag/js'
import { listFrameworks } from '@netlify/framework-info'

import { DetectedFramework } from '../frameworks/framework.js'
import { Logger } from '../logger.js'
import { report } from '../metrics.js'
import { PkgManagerFields } from '../package-managers/detect-package-manager.js'
import { Project } from '../project.js'
import { Settings } from '../settings/get-build-settings.js'
import { WorkspaceInfo } from '../workspaces/detect-workspace.js'

import { NodeFS } from './file-system.js'

export type Info = {
  jsWorkspaces: WorkspaceInfo | null
  packageManager: PkgManagerFields | null
  frameworks: DetectedFramework[]
  settings: Settings[]
  buildSystems: {
    name: string
    version?: string | undefined
  }[]
  langRuntimes: { name: string }[]
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
    bugsnagClient?: Client
  } = { featureFlags: {} },
): Promise<Info> {
  const fs = new NodeFS()
  // prevent logging in output as we use the stdout to capture the json
  fs.logger = new NoopLogger()
  const project = new Project(fs, config.projectDir, config.rootDir)
    .setBugsnag(config.bugsnagClient)
    .setEnvironment(process.env)
    .setNodeVersion(process.version)

  const info = {} as Info

  if (config.featureFlags?.build_info_new_framework_detection) {
    info.frameworks = (await project.detectFrameworksInPath(project.baseDirectory)) || []
  } else {
    try {
      // if the framework  detection is crashing we should not crash the build info and package-manager detection
      info.frameworks = (await listFrameworks({ projectDir: project.baseDirectory })) as unknown as DetectedFramework[]
    } catch (error) {
      report(error, { client: config.bugsnagClient })
      info.frameworks = []
    }
  }

  info.settings = await project.getBuildSettings()
  info.langRuntimes = await project.detectRuntime()

  // some framework detection like NX can update the workspace in the project so assign it later on
  info.jsWorkspaces = project.workspace
  info.buildSystems = project.buildSystems
  info.packageManager = project.packageManager

  return info
}
