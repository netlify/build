import Bugsnag from '@bugsnag/js'
import { parse } from 'toml'

import { FileSystem } from '../file-system.js'

import { NetlifyTOML } from './netlify-toml.js'

const {
  default: { notify },
} = Bugsnag

export type BuildSettings = {
  cmd: string
  dir: string
  framework: string
  frameworkName: string
  functions_dir?: string
  plugins: { package: string }[]
  plugins_installed?: undefined
  plugins_recommended: string[]
  template?: string
}

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

export async function getNetlifyTomlSettings(fs: FileSystem, directory: string) {
  const tomlFilePath = fs.join(directory, 'netlify.toml')

  try {
    const settings: Partial<BuildSettings> = {}
    const { build, functions, template } = gracefulParseToml<NetlifyTOML>(await fs.readFile(tomlFilePath))

    if (build) {
      settings.cmd = build?.command
      settings.dir = build.publish
    }

    settings.functions_dir = build?.functions || functions?.directory
    settings.template = template
  } catch {
    // no toml found
    return {}
  }
}
