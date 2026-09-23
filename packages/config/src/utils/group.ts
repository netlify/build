/** Group objects by the value of one of their properties, keeping the order of first appearance. */
export const groupBy = function <T>(objects: T[], keyName: keyof T): T[][] {
  const keys = [...new Set(objects.map((object) => object[keyName]))]
  return keys.map((key) => objects.filter((object) => object[keyName] === key))
}
