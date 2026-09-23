import { createRequire } from 'module'
import { pathToFileURL } from 'url'

import type { Service } from 'ts-node'

import { ROOT_PACKAGE_JSON } from '../../utils/json.js'
import { DEV_EVENTS, EVENTS } from '../events.js'

import { addTsErrorInfo } from './typescript.js'

const require = createRequire(import.meta.url)

type PluginFactory = (inputs: unknown, metadata: PluginMetadata) => unknown

type PluginMetadata = {
  events: Set<string>
  version: string | undefined
  netlifyConfig: unknown
}

// Require the plugin file and fire its top-level function.
// The returned object is the `logic` which includes all event handlers.
export const getLogic = async function ({
  pluginPath,
  inputs,
  tsNodeService,
  netlifyConfig,
}: {
  pluginPath: string
  inputs: unknown
  tsNodeService: Service | undefined
  netlifyConfig: unknown
}): Promise<unknown> {
  const logic = await importLogic(pluginPath, tsNodeService)
  const logicA = loadLogic({ logic, inputs, netlifyConfig })
  return logicA
}

const importLogic = async function (pluginPath: string, tsNodeService: Service | undefined): Promise<unknown> {
  try {
    // `ts-node` is not available programmatically for pure ES modules yet,
    // which is currently making it impossible for local plugins to use both
    // pure ES modules and TypeScript.
    if (tsNodeService !== undefined) {
      return require(pluginPath)
    }

    // `pluginPath` is an absolute file path but `import()` needs URLs.
    // Converting those with `pathToFileURL()` is needed especially on Windows
    // where the drive letter would not work with `import()`.
    // A module namespace object, whose exports TypeScript cannot know
    const returnValue = (await import(pathToFileURL(pluginPath).href)) as { default?: unknown }
    // Plugins should use named exports, but we still support default exports
    // for backward compatibility with CommonJS
    return returnValue.default === undefined ? returnValue : returnValue.default
  } catch (error) {
    addTsErrorInfo(error, tsNodeService)
    // We must change `error.stack` instead of `error.message` because some
    // errors thrown from `import()` access `error.stack` before throwing.
    // `error.stack` is lazily instantiated by Node.js, so changing
    // `error.message` afterwards would not modify `error.stack`. Therefore, the
    // resulting stack trace, which is printed in the build logs, would not
    // include the additional message prefix.
    // Plugins can throw any value: like before, this throws on primitives
    const thrown = error as { stack?: unknown }
    thrown.stack = `Could not import plugin:\n${String(thrown.stack)}`
    throw error
  }
}

const loadLogic = function ({
  logic,
  inputs,
  netlifyConfig,
}: {
  logic: unknown
  inputs: unknown
  netlifyConfig: unknown
}): unknown {
  if (!isPluginFactory(logic)) {
    return logic
  }

  const metadata = {
    events: new Set([...DEV_EVENTS, ...EVENTS]),
    version: ROOT_PACKAGE_JSON.version,
    netlifyConfig,
  }

  try {
    return logic(inputs, metadata)
  } catch (error) {
    // Plugins can throw any value: like before, this throws on primitives
    const thrown = error as { message?: unknown }
    thrown.message = `Could not load plugin:\n${String(thrown.message)}`
    throw error
  }
}

const isPluginFactory = function (logic: unknown): logic is PluginFactory {
  return typeof logic === 'function'
}
