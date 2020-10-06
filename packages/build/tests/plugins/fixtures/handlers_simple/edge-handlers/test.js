import isPlainObj from 'is-plain-obj'

// eslint-disable-next-line ava/no-import-test-files
import data from './data.json'

export function onRequest(event) {
  return [isPlainObj({}), data.a, event]
}
