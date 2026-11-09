import { type Framework } from '../frameworks/framework.js'
import { type Project } from '../project.js'

export type Settings = {
  /** A name that visualizes the settings */
  name: string
  /** The build command that should be used to execute a build */
  buildCommand?: string
  /** The dev command to serve the dev server */
  devCommand?: string
  /** The port that needs to be listened on the dev server */
  frameworkPort?: number
  /** the detected framework */
  framework: {
    id: string
    name: string
  }
  buildSystem?: {
    id: string
    name: string
  }
  /** Wether to clear the publish directory before local dev */
  clearPublishDirectory?: boolean
  /** The dist directory that contains the build output */
  dist: string
  env: Record<string, string | undefined>
  /** Plugins installed via the netlify.toml */
  plugins_from_config_file: string[]
  /** Plugins that are detected via the framework detection and therefore recommended */
  plugins_recommended: string[]
  pollingStrategies: string[]
  /** The baseDirectory for the UI to configure (used to run the command in this working directory) */
  baseDirectory?: string
  functionsDir?: string
  /** the workspace package path of an app */
  packagePath?: string
  template?: string
}

async function applyBuildSystemOverrides(
  settings: Settings,
  project: Project,
  baseDirectory?: string,
): Promise<Settings> {
  const buildSystem = project.buildSystems[0]
  const updatedSettings = { ...settings }

  if (baseDirectory && buildSystem) {
    const cmds = (await buildSystem.getCommands?.(baseDirectory)) || []
    const build = cmds.find((cmd) => cmd.type === 'build')
    const dev = cmds.find((cmd) => cmd.type === 'dev')
    const dist = await buildSystem.getDist?.(baseDirectory)
    const port = await buildSystem.getPort?.(baseDirectory)

    updatedSettings.name = `${buildSystem.name} + ${settings.name} ${baseDirectory}`
    if (build) {
      updatedSettings.buildCommand = build.command
    }

    if (dev) {
      updatedSettings.devCommand = dev.command
    }

    if (dist) {
      updatedSettings.dist = dist
    }

    if (port !== undefined && port !== null) {
      updatedSettings.frameworkPort = port
    }

    // if the build system should be run from the root then set the base directory to an empty string
    // only applicable if we have a build or dev command for it
    if (buildSystem.runFromRoot && build && dev) {
      updatedSettings.baseDirectory = ''
    }
  }

  return updatedSettings
}

/** Retrieve the settings for a framework, used inside the CLI in conjunction with getFramework */
export async function getSettings(framework: Framework, project: Project, baseDirectory: string): Promise<Settings> {
  const devCommands = framework.getDevCommands()
  const buildCommands = framework.getBuildCommands()

  const settings: Settings = {
    name: framework.name,
    buildCommand: buildCommands[0],
    devCommand: devCommands[0],
    frameworkPort: framework.dev?.port,
    dist: project.fs.join(baseDirectory, framework.build.directory),
    env: framework.env || {},
    plugins_from_config_file: [],
    plugins_recommended: framework.plugins || [],
    framework: {
      id: framework.id,
      name: framework.name,
    },
    baseDirectory,
    packagePath: baseDirectory,
    pollingStrategies: framework.dev?.pollingStrategies?.map(({ name }) => name) || [],
  }

  if (typeof framework.dev?.clearPublishDirectory !== 'undefined') {
    settings.clearPublishDirectory = framework.dev.clearPublishDirectory
  }

  if (baseDirectory?.length && project.workspace?.isRoot) {
    settings.dist = project.fs.join(baseDirectory, framework.build.directory)
  }

  // 1. try to apply overrides for package managers (like npm, pnpm or yarn workspaces)
  // 2. try to apply build system overrides
  return applyBuildSystemOverrides(
    settings,
    // await applyPackageManagerOverrides(settings, project, baseDirectory),
    project,
    baseDirectory,
  )
}

/** Retrieves the build settings for a project */
export async function getBuildSettings(project: Project, packagePath?: string): Promise<Settings[]> {
  if (project.frameworks === undefined) {
    throw new Error('Please run the framework detection before calling the build settings!')
  }

  const baseDirectory = packagePath ?? project.relativeBaseDirectory ?? ''
  const settingsPromises: Promise<Settings>[] = []
  project.logger.debug(`[get-build-settings.ts] getBuildSettings for baseDirectory: ${baseDirectory}`)
  // if we are in a workspace and trying to retrieve the settings from the root
  if (project.workspace && project.workspace.packages.length > 0 && baseDirectory.length === 0) {
    for (const [relPkg, frameworks] of [...project.frameworks.entries()]) {
      for (const framework of frameworks) {
        settingsPromises.push(getSettings(framework, project, relPkg))
      }
    }
  } else {
    // we can leverage the baseDirectory as either not running from the root of a workspace or it's not a workspace
    for (const framework of project.frameworks.get(baseDirectory) || []) {
      settingsPromises.push(getSettings(framework, project, baseDirectory))
    }
  }

  const settings = await Promise.all(settingsPromises)
  return settings.filter((setting) => {
    // filter out settings that are not matching the packagePath
    // for example we have a monorepo (where on the repository root is a site)
    //   - in this case the package path would be an empty '' string.
    //   - so we need to filter out the settings that are not matching the packagePath
    if (!setting || (packagePath !== undefined && setting.packagePath !== packagePath)) {
      return false
    }
    return true
  })
}
