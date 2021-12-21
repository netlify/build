import { normalize } from 'path'
import { platform } from 'process'

import test from 'ava'

import { runFixture } from '../helpers/main.js'
import { startTcpServer } from '../helpers/tcp_server.js'

test('Deploy plugin succeeds', async (t) => {
  const { address, requests, stopServer } = await startDeployServer()
  try {
    await runFixture(t, 'empty', { flags: { buildbotServerSocket: address } })
  } finally {
    await stopServer()
  }

  t.true(requests.every(isValidDeployReponse))
})

test('Deploy plugin sends deployDir as a path relative to repositoryRoot', async (t) => {
  const { address, requests, stopServer } = await startDeployServer()
  try {
    await runFixture(t, 'dir_path', { flags: { buildbotServerSocket: address }, snapshot: false })
  } finally {
    await stopServer()
  }

  const [{ deployDir }] = requests
  t.is(deployDir, normalize('base/publish'))
})

test('Deploy plugin is not run unless --buildbotServerSocket is passed', async (t) => {
  const { requests, stopServer } = await startDeployServer()
  try {
    await runFixture(t, 'empty', { flags: {}, snapshot: false })
  } finally {
    await stopServer()
  }

  t.is(requests.length, 0)
})

test('Deploy plugin connection error', async (t) => {
  const { address, stopServer } = await startDeployServer()
  await stopServer()
  const { exitCode, returnValue } = await runFixture(t, 'empty', {
    flags: { buildbotServerSocket: address },
    snapshot: false,
  })
  t.not(exitCode, 0)
  t.true(returnValue.includes('Could not connect to buildbot: Error: connect'))
})

test('Deploy plugin response syntax error', async (t) => {
  const { address, stopServer } = await startDeployServer({ response: 'test' })
  try {
    await runFixture(t, 'empty', { flags: { buildbotServerSocket: address } })
  } finally {
    await stopServer()
  }
})

test('Deploy plugin response system error', async (t) => {
  const { address, stopServer } = await startDeployServer({
    response: { succeeded: false, values: { error: 'test', error_type: 'system' } },
  })
  try {
    await runFixture(t, 'empty', { flags: { buildbotServerSocket: address } })
  } finally {
    await stopServer()
  }
})

test('Deploy plugin response user error', async (t) => {
  const { address, stopServer } = await startDeployServer({
    response: { succeeded: false, values: { error: 'test', error_type: 'user' } },
  })
  try {
    await runFixture(t, 'empty', { flags: { buildbotServerSocket: address } })
  } finally {
    await stopServer()
  }
})

test('Deploy plugin does not wait for post-processing if not using onSuccess nor onEnd', async (t) => {
  const { address, requests, stopServer } = await startDeployServer()
  try {
    await runFixture(t, 'empty', { flags: { buildbotServerSocket: address }, snapshot: false })
  } finally {
    await stopServer()
  }

  t.true(requests.every(doesNotWaitForPostProcessing))
})

test('Deploy plugin waits for post-processing if using onSuccess', async (t) => {
  const { address, requests, stopServer } = await startDeployServer()
  try {
    await runFixture(t, 'success', { flags: { buildbotServerSocket: address }, snapshot: false })
  } finally {
    await stopServer()
  }

  t.true(requests.every(waitsForPostProcessing))
})

test('Deploy plugin waits for post-processing if using onEnd', async (t) => {
  const { address, requests, stopServer } = await startDeployServer()
  try {
    await runFixture(t, 'end', { flags: { buildbotServerSocket: address }, snapshot: false })
  } finally {
    await stopServer()
  }

  t.true(requests.every(waitsForPostProcessing))
})

const startDeployServer = function (opts = {}) {
  const useUnixSocket = platform !== 'win32'
  return startTcpServer({ useUnixSocket, response: { succeeded: true, ...opts.response }, ...opts })
}

const isValidDeployReponse = function ({ action, deployDir }) {
  return ['deploySite', 'deploySiteAndAwaitLive'].includes(action) && typeof deployDir === 'string' && deployDir !== ''
}

const doesNotWaitForPostProcessing = function (request) {
  return request.action === 'deploySite'
}

const waitsForPostProcessing = function (request) {
  return request.action === 'deploySiteAndAwaitLive'
}
