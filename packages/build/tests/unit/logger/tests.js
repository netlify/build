import { promises as fs } from 'fs'

import { normalizeOutput } from '@netlify/testing'
import test from 'ava'
import tmp from 'tmp-promise'

import { getSystemLogger } from '../../../lib/log/logger.js'

test('System logger writes to file descriptor', async (t) => {
  const { fd, cleanup, path } = await tmp.file()
  const mockProcess = {
    stdout: [],
  }
  const systemLog = getSystemLogger(mockProcess, false, fd)
  const error = new Error('Something went wrong')

  systemLog('Hello world', { object: true, problem: false }, error)

  const output = normalizeOutput(await fs.readFile(path, 'utf8'))

  t.snapshot(normalizeOutput(output))
  t.is(mockProcess.stdout.length, 0)

  await cleanup()
})

test('System logger does not write to file descriptor when `debug: true`', async (t) => {
  const { fd, cleanup, path } = await tmp.file()
  const mockProcess = {
    stdout: [],
  }
  const systemLog = getSystemLogger(mockProcess, true, fd)
  const error = new Error('Something went wrong')

  systemLog('Hello world', { object: true, problem: false }, error)

  const output = normalizeOutput(mockProcess.stdout[0])

  t.is(mockProcess.stdout.length, 1)
  t.snapshot(normalizeOutput(output))
  t.is(await fs.readFile(path, 'utf8'), '')

  await cleanup()
})
