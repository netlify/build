import { PathLike } from 'fs'
import { access } from 'fs/promises'
import { expect } from 'vitest'

const pathExists = async (path: PathLike) => {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

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
