import test from 'ava'

import { openApiSpec } from './open_api.js'

import { NetlifyAPI } from './index.js'

test('Exported methods', (t) => {
  const api = new NetlifyAPI()

  for (const path in openApiSpec.paths) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { parameters: _, ...verbs } = openApiSpec.paths[path]

    for (const verb in verbs) {
      t.is(typeof api[verbs[verb].operationId], 'function')
    }
  }
})
