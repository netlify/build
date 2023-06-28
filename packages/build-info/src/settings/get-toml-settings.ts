import { dirname } from 'path'

import Bugsnag from '@bugsnag/js'
import { parse } from 'toml'

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
    return parse(content)
  } catch (error) {
    notify(error, (event) => {
      event.context = '@netlify/build-info => gracefullyParseToml => toml.parse'
      event.severity = 'info'
    })
    return {} as T
  }
}

/** Mutates the provided settings by setting the property if the value is not undefined  */
function addProperty<P extends keyof Settings>(
  settings: Partial<Settings>,
  property: P,
  value?: Settings[P],
): Partial<Settings> {
  if (value) {
    settings[property] = value
  }
  return settings
}

export async function getTomlSettingsFromPath(
  fs: FileSystem,
  directory: string,
): Promise<Partial<Settings> | undefined> {
  const tomlFilePath = fs.join(directory, 'netlify.toml')

  try {
    const settings: Partial<Settings> = {}
    const { build, dev, functions, template, plugins } = gracefulParseToml<NetlifyTOML>(await fs.readFile(tomlFilePath))

    addProperty(settings, 'buildCommand', build?.command)
    addProperty(settings, 'dist', build?.publish)
    addProperty(settings, 'devCommand', dev?.command)
    addProperty(settings, 'frameworkPort', dev?.port)
    addProperty(
      settings,
      'plugins_installed',
      plugins?.map((p) => p.package),
    )
    addProperty(settings, 'functionsDir', build?.functions || functions?.directory)
    addProperty(settings, 'template', template)

    return settings
  } catch {
    // no toml found or issue while parsing it
  }
}

export async function getTomlSettings(project: Project, configFilePath?: string): Promise<Partial<Settings>> {
  if (configFilePath?.length) {
    return (await getTomlSettingsFromPath(project.fs, dirname(configFilePath))) || {}
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
