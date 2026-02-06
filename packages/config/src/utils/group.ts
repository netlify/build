/**
 * Group objects according to a key attribute.
 * The key must exist in each object and be a string.
 */
export const groupBy = function <T, K extends keyof T>(objects: T[], keyName: K): T[][] {
  const keys = [...new Set(objects.map((object) => object[keyName]))]
  return keys.map((key) => groupObjects(objects, keyName, key))
}

const groupObjects = function <T, K extends keyof T>(objects: T[], keyName: K, key: T[K]): T[] {
  return objects.filter((object) => object[keyName] === key)
}
