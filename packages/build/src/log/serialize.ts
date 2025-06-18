import { stringify } from 'yaml'

export const serializeObject = function (object: object): string {
  return stringify(object, { sortMapEntries: true }).trimEnd()
}

export const serializeArray = function (array: string[]) {
  return array.map(addDash).join('\n')
}

const addDash = function (string: string) {
  return ` - ${string}`
}
