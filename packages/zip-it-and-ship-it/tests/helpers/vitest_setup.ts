import { expect } from 'vitest'

import { pathExists } from '../../src/utils/fs.js'

expect.extend({
  async toPathExist(received) {
    const { isNot } = this

    return {
      // do not alter your "pass" based on isNot. Vitest does it for you
      pass: await pathExists(received),
      message: () => `Path ${received} does${isNot ? '' : ' not'} exist`,
    }
  },
})
