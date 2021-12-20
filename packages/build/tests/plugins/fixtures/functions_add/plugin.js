import { fileURLToPath } from 'url'

const TEST_FILE = fileURLToPath(new URL('test', import.meta.url))

export default {
  async onPreBuild({
    utils: {
      functions: { add },
    },
  }) {
    await add(TEST_FILE)
  },
}
