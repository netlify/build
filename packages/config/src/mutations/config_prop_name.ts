/** Properties with dynamic children */
const DYNAMIC_OBJECT_PROPS = new Set(['build.services', 'build.environment', 'functions', 'functions.*'])

/** Retrieve normalized property name */
export const getPropName = function (keys: string[]) {
  // Some properties are user-defined, i.e. we need to replace them with a "*" token
  // Check if a property name is dynamic, such as `functions.{functionName}`, or
  // is an array index.
  // In those cases, we replace it by "*".
  return keys.reduce((propName, key) => {
    const normalizedKey = Number.isInteger(key) || DYNAMIC_OBJECT_PROPS.has(propName) ? '*' : String(key)
    return propName === '' ? normalizedKey : `${propName}.${normalizedKey}`
  }, '')
}
