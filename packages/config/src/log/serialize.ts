import { stringify } from 'yaml'

export const serializeObject = function (object: object): string {
  return stringify(object, { sortMapEntries: true }).trimEnd()
}
