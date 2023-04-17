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
  /** The name of the detected framework */
  framework: string
  /** The dist directory that contains the build output */
  dist: string
  env: Record<string, string | undefined>
  plugins: string[]
  pollingStrategies: string[]
  baseDirectory?: string
  tomlModifications?: string
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
  }

  return updatedSettings
}

async function getSettings(framework: Framework, project: Project, baseDirectory?: string): Promise<Settings> {
  const frameworkDist = framework.staticAssetsDirectory || framework.build.directory

  const devCommands = framework.getDevCommands()

  const settings: Settings = {
    name: framework.name,
    buildCommand: framework.build.command,
    devCommand: devCommands[0],
    frameworkPort: framework.dev?.port,
    dist: frameworkDist,
    env: framework.env || {},
    plugins: framework.plugins || [],
    framework: framework.name,
    baseDirectory,
    pollingStrategies: framework.dev?.pollingStrategies?.map(({ name }) => name) || [],
  }

  if (baseDirectory?.length && project.workspace?.isRoot) {
    settings.dist = project.fs.join(baseDirectory, frameworkDist)
  }

  return applyBuildSystemOverrides(settings, project, baseDirectory)
}

export async function getBuildSettings(project: Project): Promise<Settings[]> {
  if (project.frameworks === undefined) {
    throw new Error('Please run the framework detection before calling the build settings!')
  }

  if (!project.workspace?.packages.length) {
    const frameworks = project.frameworks.get('') || [] // get the frameworks for non workspace settings
    const settings = await Promise.all(frameworks.map((framework) => getSettings(framework, project)))
    return settings.filter(Boolean) as Settings[]
  }

  const settings = await Promise.all(
    project.workspace.packages.map(async (baseDirectory) => {
      const framework = project.frameworks.get(baseDirectory)

      if (framework?.length) {
        return getSettings(framework[0], project, baseDirectory)
      }
    }),
  )

  return settings.filter(Boolean) as Settings[]
}
