import { createRequire } from 'module'
import { pathToFileURL } from 'url'

import { ROOT_PACKAGE_JSON } from '../../utils/json.js'
import { DEV_EVENTS, EVENTS } from '../events.js'

import { addTsErrorInfo } from './typescript.js'

const require = createRequire(import.meta.url)

// Require the plugin file and fire its top-level function.
// The returned object is the `logic` which includes all event handlers.
export const getLogic = async function ({ pluginPath, inputs, tsNodeService, netlifyConfig }) {
  const logic = await importLogic(pluginPath, tsNodeService)
  const logicA = loadLogic({ logic, inputs, netlifyConfig })
  return logicA
}

const importLogic = async function (pluginPath, tsNodeService) {
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
    const returnValue = await import(pathToFileURL(pluginPath))
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
    error.stack = `Could not import plugin:\n${error.stack}`
    throw error
  }
}

const loadLogic = function ({ logic, inputs, netlifyConfig }) {
  if (typeof logic !== 'function') {
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
    error.message = `Could not load plugin:\n${error.message}`
    throw error
  }
}
