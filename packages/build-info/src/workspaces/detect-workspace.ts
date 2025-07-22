import type { PackageJson } from 'read-pkg'
import { parse } from 'yaml'

import { FrameworkName } from '../frameworks/index.js'
import { PkgManager } from '../package-managers/detect-package-manager.js'
import { Project } from '../project.js'

import { getWorkspacePackages } from './get-workspace-packages.js'

export type WorkspacePackage = {
  path: string
  name?: string
  /** For some workspaces like Nx Integrated the build system is aware of the framework */
  forcedFramework?: FrameworkName
}

export class WorkspaceInfo {
  /** if we are in the current workspace root or not */
  isRoot: boolean
  /** the workspace root directory */
  rootDir: string
  /** list of relative package paths inside the workspace */
  packages: WorkspacePackage[] = []

  /** Detects if a workspace has a sub package */
  hasPackage(relativePackagePath: string): boolean {
    return this.packages.findIndex(({ path }) => path === relativePackagePath) > -1
  }

  getPackage(relativePackagePath: string): WorkspacePackage | undefined {
    return this.packages.find(({ path }) => path === relativePackagePath)
  }
}

/**
 * Get a list of globs about all the packages inside a pnpm workspace
 * https://pnpm.io/pnpm-workspace_yaml
 */
export async function detectPnpmWorkspaceGlobs(project: Project): Promise<string[]> {
  const workspaceFile = await project.fs.findUp('pnpm-workspace.yaml', {
    cwd: project.baseDirectory,
    stopAt: project.root,
  })
  if (!workspaceFile) {
    return []
  }

  try {
    const { packages = [] } = parse(await project.fs.readFile(workspaceFile))
    return packages
  } catch {
    return []
  }
}

/** Get the workspace globs from the package.json file */
export async function detectNpmOrYarnWorkspaceGlobs(pkgJSON: Partial<PackageJson>): Promise<string[]> {
  if (Array.isArray(pkgJSON.workspaces)) {
    return pkgJSON.workspaces || []
  }
  if (typeof pkgJSON.workspaces === 'object') {
    return pkgJSON.workspaces.packages || []
  }
  return []
}

/**
 * If it's a javascript workspace (npm, pnpm, yarn) it will retrieve a list of all
 * package paths and will indicate if it's the root of the workspace
 */
export async function detectWorkspaces(project: Project): Promise<WorkspaceInfo | null> {
  if (project.packageManager === undefined) {
    throw new Error('Please run the packageManager detection before calling the workspace detection!')
  }

  // if it's null it indicates it was already run without any result so we can omit this here as well
  if (project.packageManager === null) {
    return null
  }

  if (await project.isRedwoodProject()) {
    return null
  }

  const pkgJSON = await project.getRootPackageJSON()
  const workspaceGlobs =
    project.packageManager.name === PkgManager.PNPM
      ? await detectPnpmWorkspaceGlobs(project)
      : await detectNpmOrYarnWorkspaceGlobs(pkgJSON)

  if (!workspaceGlobs || workspaceGlobs.length === 0) {
    return null
  }

  // indicate that we have found some globs and starting to parse them
  project.events.emit('detectedWorkspaceGlobs', undefined)
  const info = new WorkspaceInfo()
  info.rootDir = project.jsWorkspaceRoot
  info.packages = await getWorkspacePackages(project, workspaceGlobs)
  info.isRoot = project.baseDirectory === project.jsWorkspaceRoot
  const relBaseDirectory = project.fs.relative(project.jsWorkspaceRoot, project.baseDirectory)
  // if the current base directory is not part of the detected workspace packages it's not part of this workspace
  // and therefore return no workspace info
  if (!info.isRoot && !info.hasPackage(relBaseDirectory)) {
    return null
  }

  return info
}
