import Bugsnag from '@bugsnag/js'
import { parse } from 'smol-toml'

import { FileSystem } from '../file-system.js'
import { Project } from '../project.js'

import { Settings } from './get-build-settings.js'
import { NetlifyTOML } from './netlify-toml.js'

const {
  default: { notify },
} = Bugsnag

/** Gracefully parses a toml file and reports errors to bugsnag */
function gracefulParseToml<T>(content: string): T {
  try {
    return parse(content) as T
  } catch (error) {
    notify(error, (event) => {
      event.context = '@netlify/build-info => gracefullyParseToml => toml.parse'
      event.severity = 'info'
    })
    return {} as T
  }
}

export async function getTomlSettingsFromPath(
  fs: FileSystem,
  directory: string,
): Promise<Partial<Settings> | undefined> {
  const tomlFilePath = fs.join(directory, 'netlify.toml')

  try {
    const settings: Partial<Settings> = {}
    const { build, dev, functions, template, plugins } = gracefulParseToml<NetlifyTOML>(await fs.readFile(tomlFilePath))

    settings.buildCommand = build?.command ?? settings.buildCommand
    settings.dist = build?.publish ?? settings.dist
    settings.devCommand = dev?.command ?? settings.devCommand
    settings.frameworkPort = dev?.port ?? settings.frameworkPort
    settings.plugins_from_config_file = plugins?.map((p) => p.package) ?? settings.plugins_from_config_file
    settings.functionsDir = (build?.functions || functions?.directory) ?? settings.functionsDir
    settings.template = template ?? settings.template

    return settings
  } catch {
    // no toml found or issue while parsing it
  }
}

export async function getTomlSettings(project: Project, configFilePath?: string): Promise<Partial<Settings>> {
  if (configFilePath?.length) {
    return (await getTomlSettingsFromPath(project.fs, project.fs.dirname(configFilePath))) || {}
  }

  const baseDirSettings = await getTomlSettingsFromPath(project.fs, project.baseDirectory)
  if (baseDirSettings) {
    return baseDirSettings
  }

  if (project.root) {
    const rootSettings = await getTomlSettingsFromPath(project.fs, project.root)
    return rootSettings || {}
  }

  return {}
}
