import isPlainObj from 'is-plain-obj'

import data from './data.json'

export function onRequest(event) {
  return [isPlainObj({}), data.a, event]
}
