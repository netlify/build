import { readFile } from 'fs/promises'

import { expect, test } from 'vitest'

import { FIXTURES_ESM_DIR, unzipFiles, zipFixture } from './helpers/main.js'

test('includes a `.env` file resolved from `process.cwd()` by a dependency when bundling a v2 function', async () => {
  const { files } = await zipFixture('v2-api-env-file', { fixtureDir: FIXTURES_ESM_DIR })

  expect(files[0].bundler).toBe('nft')
  expect(files[0].runtimeAPIVersion).toBe(2)

  const [{ unzipPath }] = await unzipFiles(files)

  await expect(`${unzipPath}/.env`).toPathExist()
  expect(await readFile(`${unzipPath}/.env`, 'utf8')).toBe('MY_SECRET=hello-from-env\n')
})
