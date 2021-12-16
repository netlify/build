import { dump } from 'js-yaml'

export const serializeObject = function (object) {
  return dump(object, { noRefs: true, sortKeys: true, lineWidth: Number.POSITIVE_INFINITY }).trimRight()
}

export const serializeArray = function (array) {
  return array.map(addDash).join('\n')
}

const addDash = function (string) {
  return ` - ${string}`
}
