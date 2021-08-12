import isPlainObj from 'is-plain-obj'

import data from './data.json'

export const onRequest = function (event) {
  return [isPlainObj({}), data.a, event]
}
