import { promises as fs } from 'fs'

import test from 'ava'
import tmp from 'tmp-promise'

import { getSystemLogger } from '../../../src/log/logger.js'

test('System logger writes to file descriptor', async (t) => {
  const { fd, cleanup, path } = await tmp.file()
  const mockProcess = {
    stdout: [],
  }
  const systemLog = getSystemLogger(mockProcess, false, fd)

  systemLog('Hello world', { object: true, problem: false })

  t.is(await fs.readFile(path, 'utf8'), 'Hello world {"object":true,"problem":false}')
  t.is(mockProcess.stdout.length, 0)

  await cleanup()
})

test('System logger does not write to file descriptor when `debug: true`', async (t) => {
  const { fd, cleanup, path } = await tmp.file()
  const mockProcess = {
    stdout: [],
  }
  const systemLog = getSystemLogger(mockProcess, true, fd)

  systemLog('Hello world', { object: true, problem: false })

  t.is(mockProcess.stdout.length, 1)
  t.is(mockProcess.stdout[0], 'Hello world {"object":true,"problem":false}')
  t.is(await fs.readFile(path, 'utf8'), '')

  await cleanup()
})
