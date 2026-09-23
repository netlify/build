import type { PackageJson } from 'read-package-up'

import { addErrorInfo } from '../../error/info.js'
import { serializeObject } from '../../log/serialize.js'
import { THEME } from '../../log/theme.js'

import type { PluginManifest, PluginManifestInput } from './validate.js'

type Inputs = Record<string, unknown>

type InputErrorContext = {
  packageName: string
  pluginPackageJson: PackageJson
  loadedFrom: unknown
  origin: unknown
}

// Check that plugin inputs match the validation specified in "manifest.yml"
// Also assign default values
export const checkInputs = function ({
  inputs,
  manifest: { inputs: rules = [] },
  packageName,
  pluginPackageJson,
  loadedFrom,
  origin,
}: InputErrorContext & { inputs: unknown; manifest: PluginManifest }): Inputs {
  // `useManifest()` types `inputs` as `unknown`, but they are always the plugin's normalized `inputs` object
  const pluginInputs = inputs as Inputs
  try {
    const inputsA = addDefaults(pluginInputs, rules)
    checkRequiredInputs({ inputs: inputsA, rules, packageName, pluginPackageJson, loadedFrom, origin })
    checkUnknownInputs({ inputs: inputsA, rules, packageName, pluginPackageJson, loadedFrom, origin })
    return inputsA
  } catch (error) {
    if (error instanceof Error) {
      error.message = `${error.message}

${THEME.errorSubHeader('Plugin inputs')}
${serializeObject(pluginInputs)}`
    }
    throw error
  }
}

// Add "inputs[*].default"
const addDefaults = function (inputs: Inputs, rules: PluginManifestInput[]): Inputs {
  const defaults = rules.filter(hasDefault).map(getDefault)
  return [...defaults, inputs].reduce<Inputs>((target, source) => Object.assign(target, source), {})
}

const hasDefault = function (rule: PluginManifestInput): boolean {
  return rule.default !== undefined
}

const getDefault = function ({ name, default: defaultValue }: PluginManifestInput): Inputs {
  return { [name]: defaultValue }
}

type CheckInputsArgs = InputErrorContext & { inputs: Inputs; rules: PluginManifestInput[] }

// Check "inputs[*].required"
const checkRequiredInputs = function ({
  inputs,
  rules,
  packageName,
  pluginPackageJson,
  loadedFrom,
  origin,
}: CheckInputsArgs): void {
  const missingInputs = rules.filter((rule) => isMissingRequired(inputs, rule))
  if (missingInputs.length === 0) {
    return
  }

  const names = missingInputs.map(getName)
  const error = new Error(`Required inputs for plugin "${packageName}": ${names.join(', ')}`)
  addInputError({ error, name: names[0], packageName, pluginPackageJson, loadedFrom, origin })
  throw error
}

const isMissingRequired = function (inputs: Inputs, { name, required }: PluginManifestInput): boolean | undefined {
  return required && inputs[name] === undefined
}

const getName = function ({ name }: PluginManifestInput): string {
  return name
}

// Check each "inputs[*].*" property for a specific input
const checkUnknownInputs = function ({
  inputs,
  rules,
  packageName,
  pluginPackageJson,
  loadedFrom,
  origin,
}: CheckInputsArgs): void {
  const knownInputs = rules.map(getName)
  const unknownInputs = Object.keys(inputs).filter((name) => !knownInputs.includes(name))
  if (unknownInputs.length === 0) {
    return
  }

  const unknownInputsMessage = getUnknownInputsMessage({ packageName, knownInputs, unknownInputs })
  const error = new Error(`${unknownInputsMessage}
Check your plugin configuration to be sure that:
  - the input name is spelled correctly
  - the input is included in the plugin's available configuration options
  - the plugin's input requirements have not changed`)
  const [name] = unknownInputs
  addInputError({ error, name, packageName, pluginPackageJson, loadedFrom, origin })
  throw error
}

const getUnknownInputsMessage = function ({
  packageName,
  knownInputs,
  unknownInputs,
}: {
  packageName: string
  knownInputs: string[]
  unknownInputs: string[]
}): string {
  const unknownInputsStr = unknownInputs.map(quoteWord).join(', ')

  if (knownInputs.length === 0) {
    return `Plugin "${packageName}" does not accept any inputs but you specified: ${unknownInputsStr}`
  }

  const knownInputsStr = knownInputs.map(quoteWord).join(', ')
  return `Unknown inputs for plugin "${packageName}": ${unknownInputsStr}
Plugin inputs should be one of: ${knownInputsStr}`
}

const quoteWord = function (word: string): string {
  return `"${word}"`
}

// Add error information
const addInputError = function ({
  error,
  name,
  packageName,
  pluginPackageJson,
  loadedFrom,
  origin,
}: InputErrorContext & { error: Error; name: string | undefined }): void {
  addErrorInfo(error, {
    type: 'pluginInput',
    plugin: { packageName, pluginPackageJson },
    location: { event: 'load', packageName, input: name, loadedFrom, origin },
  })
}
