import { normalize } from 'path'
import { platform } from 'process'

import { Fixture, normalizeOutput, startTcpServer } from '@netlify/testing'
import test from 'ava'

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

test('Deploy plugin succeeds', async (t) => {
  const { address, requests, stopServer } = await startDeployServer()
  try {
    const output = await new Fixture('./fixtures/empty').withFlags({ buildbotServerSocket: address }).runWithBuild()
    t.snapshot(normalizeOutput(output))
  } finally {
    await stopServer()
  }

  t.true(requests.every(isValidDeployReponse))
})

test('Deploy plugin sends deployDir as a path relative to repositoryRoot', async (t) => {
  const { address, requests, stopServer } = await startDeployServer()
  try {
    await new Fixture('./fixtures/dir_path').withFlags({ buildbotServerSocket: address }).runWithBuild()
  } finally {
    await stopServer()
  }

  const [{ deployDir }] = requests
  t.is(deployDir, normalize('base/publish'))
})

test('Deploy plugin is not run unless --buildbotServerSocket is passed', async (t) => {
  const { requests, stopServer } = await startDeployServer()
  try {
    await new Fixture('./fixtures/empty').runWithBuild()
  } finally {
    await stopServer()
  }

  t.is(requests.length, 0)
})

test('Deploy plugin connection error', async (t) => {
  const { address, stopServer } = await startDeployServer()
  await stopServer()
  const output = await new Fixture('./fixtures/empty').withFlags({ buildbotServerSocket: address }).runWithBuild()
  t.true(output.includes('Internal error during "Deploy site"'))
})

test('Deploy plugin response syntax error', async (t) => {
  const { address, stopServer } = await startDeployServer({ response: 'test' })
  try {
    const output = await new Fixture('./fixtures/empty').withFlags({ buildbotServerSocket: address }).runWithBuild()
    // This shape of this error can change with different Node.js versions.
    t.true(output.includes('Internal error during "Deploy site"'))
  } finally {
    await stopServer()
  }
})

test('Deploy plugin response system error', async (t) => {
  const { address, stopServer } = await startDeployServer({
    response: { succeeded: false, values: { error: 'test', error_type: 'system' } },
  })
  try {
    const output = await new Fixture('./fixtures/empty').withFlags({ buildbotServerSocket: address }).runWithBuild()
    t.snapshot(normalizeOutput(output))
  } finally {
    await stopServer()
  }
})

test('Deploy plugin response user error', async (t) => {
  const { address, stopServer } = await startDeployServer({
    response: { succeeded: false, values: { error: 'test', error_type: 'user' } },
  })
  try {
    const output = await new Fixture('./fixtures/empty').withFlags({ buildbotServerSocket: address }).runWithBuild()
    t.snapshot(normalizeOutput(output))
  } finally {
    await stopServer()
  }
})

test('Deploy plugin does not wait for post-processing if not using onSuccess nor onEnd', async (t) => {
  const { address, requests, stopServer } = await startDeployServer()
  try {
    await new Fixture('./fixtures/empty').withFlags({ buildbotServerSocket: address }).runWithBuild()
  } finally {
    await stopServer()
  }

  t.true(requests.every(doesNotWaitForPostProcessing))
})

test('Deploy plugin waits for post-processing if using onSuccess', async (t) => {
  const { address, requests, stopServer } = await startDeployServer()
  try {
    await new Fixture('./fixtures/success').withFlags({ buildbotServerSocket: address }).runWithBuild()
  } finally {
    await stopServer()
  }

  t.true(requests.every(waitsForPostProcessing))
})

test('Deploy plugin waits for post-processing if using onEnd', async (t) => {
  const { address, requests, stopServer } = await startDeployServer()
  try {
    await new Fixture('./fixtures/end').withFlags({ buildbotServerSocket: address }).runWithBuild()
  } finally {
    await stopServer()
  }

  t.true(requests.every(waitsForPostProcessing))
})

test('Deploy plugin specifies deploy-specific variables in deploy event', async (t) => {
  const { address, requests, stopServer } = await startDeployServer()
  try {
    await new Fixture('./fixtures/deploy_environment_variables')
      .withFlags({ buildbotServerSocket: address })
      .runWithBuild()
  } finally {
    await stopServer()
  }

  t.true(requests.length === 1)
  t.deepEqual(requests[0].environment, [
    {
      is_secret: false,
      key: 'DATABASE_URI',
      value: '',
      scopes: ['builds', 'functions', 'post_processing', 'runtime'],
    },
    {
      is_secret: true,
      key: 'DATABASE_PASSWORD',
      value: 'collision',
      scopes: ['builds', 'functions', 'runtime'],
    },
    {
      is_secret: false,
      key: 'DATABASE_MOOD',
      value: 'feisty',
      scopes: ['builds', 'functions', 'post_processing', 'runtime'],
    },
  ])
})

test('Deploy plugin returns an internal deploy error if the server responds with a 500', async (t) => {
  const { address, stopServer } = await startDeployServer({
    response: { succeeded: false, values: { error: 'test', error_type: 'user', code: '500' } },
  })
  try {
    const {
      success,
      severityCode,
      logs: { stdout },
    } = await new Fixture('./fixtures/empty').withFlags({ buildbotServerSocket: address }).runBuildProgrammatic()
    t.false(success)
    // system-error code
    t.is(severityCode, 4)
    const output = stdout.join('\n')
    t.true(output.includes('Internal error deploying'))
    t.true(output.includes('Deploy did not succeed with HTTP Error 500'))
  } finally {
    await stopServer()
  }
})

test('Deploy plugin returns a  deploy error if the server responds with a 4xx', async (t) => {
  const { address, stopServer } = await startDeployServer({
    response: { succeeded: false, values: { error: 'test', error_type: 'user', code: '401' } },
  })
  try {
    const {
      success,
      severityCode,
      logs: { stdout },
    } = await new Fixture('./fixtures/empty').withFlags({ buildbotServerSocket: address }).runBuildProgrammatic()
    t.false(success)
    // user-error code
    t.is(severityCode, 2)
    const output = stdout.join('\n')
    t.true(output.includes('Error deploying'))
    t.true(output.includes('Deploy did not succeed with HTTP Error 401'))
  } finally {
    await stopServer()
  }
})
