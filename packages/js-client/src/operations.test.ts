import { expect, test } from 'vitest'

import { openApiSpec } from './open_api.js'

import { NetlifyAPI } from './index.js'

test('Exported methods', () => {
  const api = new NetlifyAPI()

  for (const path in openApiSpec.paths) {
    const { parameters: _, ...verbs } = openApiSpec.paths[path]

    for (const verb in verbs) {
      expect(typeof api[verbs[verb].operationId]).toBe('function')
    }
  }
})
