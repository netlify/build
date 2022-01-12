import { fileURLToPath } from 'url'

const TEST_FILE = fileURLToPath(new URL('test', import.meta.url))

export const onPreBuild = async function ({
  utils: {
    functions: { add },
  },
}) {
  await add(TEST_FILE)
}
