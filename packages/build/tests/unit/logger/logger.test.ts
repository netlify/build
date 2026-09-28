import { promises as fs } from 'fs'

import { normalizeOutput } from '@netlify/testing'
import tmp from 'tmp-promise'
import { expect, test } from 'vitest'

import { type BufferedLogs, getSystemLogger } from '../../../lib/log/logger.js'

test('System logger writes to file descriptor', async () => {
  const { fd, cleanup, path } = await tmp.file()
  const mockProcess: BufferedLogs = {
    stdout: [],
    stderr: [],
  }
  const systemLog = getSystemLogger(mockProcess, false, fd)
  const error = new Error('Something went wrong')

  systemLog('Hello world', { object: true, problem: false }, error)

  const output = normalizeOutput(await fs.readFile(path, 'utf8'))

  expect(normalizeOutput(output)).toMatchSnapshot()
  expect(mockProcess.stdout).toHaveLength(0)

  await cleanup()
})

test('System logger does not write to file descriptor when `debug: true`', async () => {
  const { fd, cleanup, path } = await tmp.file()
  const mockProcess: BufferedLogs = {
    stdout: [],
    stderr: [],
  }
  const systemLog = getSystemLogger(mockProcess, true, fd)
  const error = new Error('Something went wrong')

  systemLog('Hello world', { object: true, problem: false }, error)

  const output = normalizeOutput(mockProcess.stdout[0])

  expect(mockProcess.stdout).toHaveLength(1)
  expect(normalizeOutput(output)).toMatchSnapshot()
  expect(await fs.readFile(path, 'utf8')).toBe('')

  await cleanup()
})
