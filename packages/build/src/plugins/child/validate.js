import { addErrorInfo } from '../../error/info.js'
import { serializeArray } from '../../log/serialize.js'
import { EVENTS } from '../events.js'

// Validate the shape of a plugin return value
export const validatePlugin = function (logic) {
  try {
    // This validation must work with the return value of `import()` which has
    // a `Module` prototype, not `Object`
    if (typeof logic !== 'object' || logic === null) {
      throw new Error('Plugin must be an object or a function')
    }

    Object.entries(logic).forEach(([propName, value]) => {
      validateEventHandler(value, propName)
    })
  } catch (error) {
    addErrorInfo(error, { type: 'pluginValidation' })
    throw error
  }
}

// All other properties are event handlers
const validateEventHandler = function (value, propName) {
  if (!EVENTS.includes(propName)) {
    throw new Error(`Invalid event '${propName}'.
Please use a valid event name. One of:
${serializeArray(EVENTS)}`)
  }

  if (typeof value !== 'function') {
    throw new TypeError(`Invalid event handler '${propName}': must be a function`)
  }
}
