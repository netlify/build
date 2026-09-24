import { throwUserError } from './error.js'
import { logWarning } from './log.js'
import { mergeConfigs } from './merge.js'
import type { Logs, SourceConfig, SourceEntry, SourcePlugin } from './types.js'

export const mergeSources = function ({
  defaultConfig,
  fileConfig,
  inlineConfig,
  context,
  branch,
  logs,
}: {
  defaultConfig: SourceConfig
  fileConfig: SourceConfig
  inlineConfig: SourceConfig
  context: string
  branch: string
  logs: Logs | undefined
}): SourceEntry {
  const withContexts = mergeConfigs([defaultConfig, fileConfig])
  const withoutContexts = applyContexts(withContexts, [context, branch], logs)
  // `inlineConfig` comes after the contexts, so its own `context` is kept as is but never applied.
  return mergeConfigs<SourceEntry>([withoutContexts, inlineConfig])
}

const applyContexts = function (
  { context: entries, ...config }: SourceConfig,
  names: readonly string[],
  logs: Logs | undefined,
): SourceEntry {
  if (entries === undefined) {
    return config
  }

  checkUiPluginsInContexts({ entries, plugins: config.plugins ?? [], names, logs })
  return mergeConfigs([config, ...names.flatMap((name) => findMatchingEntries(entries, name))])
}

// An exact match wins. Otherwise every `prefix*` entry matching the name applies, in key order, so
// the last one wins. Entries are looked up as own properties, so `constructor` is not inherited.
const findMatchingEntries = function (entries: Record<string, SourceEntry>, name: string): SourceEntry[] {
  if (name === '') {
    return []
  }

  const exactMatch = Object.hasOwn(entries, name) ? entries[name] : undefined
  if (exactMatch !== undefined) {
    return [exactMatch]
  }

  return Object.entries(entries)
    .filter(([key]) => key.endsWith('*') && name.startsWith(key.slice(0, -1)))
    .map(([, entry]) => entry)
}

// A UI plugin runs in every context, so configuring it in a context entry, applied or not, warns.
// It fails when the entry has no inputs and isn't for this build.
const checkUiPluginsInContexts = function ({
  entries,
  plugins,
  names,
  logs,
}: {
  entries: Record<string, SourceEntry>
  plugins: readonly SourcePlugin[]
  names: readonly string[]
  logs: Logs | undefined
}): void {
  for (const [entryName, entry] of Object.entries(entries)) {
    for (const { package: packageName, inputs } of entry.plugins ?? []) {
      if (isInstalledInUi(plugins, packageName)) {
        checkUiPluginInContext({ packageName: String(packageName), inputs, entryName, names, logs })
      }
    }
  }
}

const isInstalledInUi = (plugins: readonly SourcePlugin[], packageName: unknown): boolean =>
  plugins.some((plugin) => plugin['package'] === packageName && plugin.origin === 'ui')

const checkUiPluginInContext = function ({
  packageName,
  inputs,
  entryName,
  names,
  logs,
}: {
  packageName: string
  inputs: unknown
  entryName: string
  names: readonly string[]
  logs: Logs | undefined
}): void {
  const message = `
"${packageName}" is installed in the UI, which means that it runs in all deploy contexts, regardless of file-based configuration.
To run "${packageName}" in the ${entryName} context only, uninstall the plugin from the site plugins list.`

  // QUIRK: the entry name is compared as is, so a wildcard entry never counts as this build's.
  if (!names.includes(entryName) && hasNoInputs(inputs)) {
    throwUserError(`${message}
To run "${packageName}" in all contexts, please remove the following section from "netlify.toml".

  [[context.${entryName}.plugins]]
  package = "${packageName}"
`)
  }

  logWarning(logs, message)
}

const hasNoInputs = (inputs: unknown): boolean =>
  inputs === undefined || inputs === null || Object.keys(inputs).length === 0
