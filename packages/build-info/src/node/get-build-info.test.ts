import { expect, test } from 'vitest'

import { mockFileSystem } from '../../tests/mock-file-system.js'
import { getBuildInfo } from '../node/get-build-info.js'

test('should detect nothing in an empty project', async () => {
  const cwd = mockFileSystem({})
  const info = await getBuildInfo(cwd)
  expect(info).toMatchInlineSnapshot(`
    {
      "buildSystems": [],
      "frameworks": [],
      "jsWorkspaces": null,
      "packageManager": null,
    }
  `)
})

test('should detect nothing in a simple golang project', async () => {
  const cwd = mockFileSystem({
    'go.mod': '',
    'main.go': '',
  })
  const info = await getBuildInfo(cwd)
  expect(info).toMatchInlineSnapshot(`
    {
      "buildSystems": [],
      "frameworks": [],
      "jsWorkspaces": null,
      "packageManager": null,
    }
  `)
})
