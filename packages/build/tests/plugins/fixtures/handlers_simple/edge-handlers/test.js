import isPlainObj from 'is-plain-obj'

// eslint-disable-next-line ava/no-import-test-files
import data from './data.json'

export const onRequest = function (event) {
  return [isPlainObj({}), data.a, event]
}
