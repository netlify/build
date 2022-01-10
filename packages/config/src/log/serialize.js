import { dump } from 'js-yaml'

export const serializeObject = function (object) {
  return dump(object, { noRefs: true, sortKeys: true, lineWidth: Number.POSITIVE_INFINITY }).trimEnd()
}
