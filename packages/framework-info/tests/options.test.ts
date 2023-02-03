import process from 'process'

import { expect, test, vi } from 'vitest'

import { listFrameworks } from '../src/main.js'

import { FIXTURES_DIR } from './helpers/main.js'

test('projectDir option defaults to process.cwd()', async () => {
  const spyInstance = vi.spyOn(process, 'cwd').mockReturnValue(`${FIXTURES_DIR}/simple`)
  const frameworks = await listFrameworks({})
  expect(frameworks).toHaveLength(1)
  spyInstance.mockRestore()
})

test('Can trigger with no options', async () => {
  const spyInstance = vi.spyOn(process, 'cwd').mockReturnValue(`${FIXTURES_DIR}/simple`)
  const frameworks = await listFrameworks()
  expect(frameworks).toHaveLength(1)
  spyInstance.mockRestore()
})
